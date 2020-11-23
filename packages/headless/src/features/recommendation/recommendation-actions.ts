import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {historyStore} from '../../api/analytics/analytics';
import {RecommendationRequest} from '../../api/search/recommendation/recommendation-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {Result} from '../../api/search/search/result';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  FieldsSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
} from '../../state/state-sections';
import {SearchAction} from '../analytics/analytics-actions';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';
import {logRecommendationUpdate} from './recommendation-analytics-actions';

export type StateNeededByGetRecommendations = ConfigurationSection &
  RecommendationSection &
  Partial<
    SearchHubSection &
      PipelineSection &
      AdvancedSearchQueriesSection &
      ContextSection &
      FieldsSection
  >;

export interface GetRecommendationsThunkReturn {
  recommendations: Result[];
  analyticsAction: SearchAction;
  duration: number;
}

/**
 * Set recommendation identifier.
 */
export const setRecommendationId = createAction(
  'recommendation/set',
  (payload: {id: string}) =>
    validatePayloadSchema(payload, {
      id: new StringValue({required: true, emptyAllowed: false}),
    })
);

/**
 * Get recommendations.
 */
export const getRecommendations = createAsyncThunk<
  GetRecommendationsThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByGetRecommendations>
>(
  'recommendation/get',
  async (_, {getState, rejectWithValue, extra: {searchAPIClient}}) => {
    const state = getState();
    const startedAt = new Date().getTime();
    const fetched = await searchAPIClient.recommendations(
      buildRecommendationRequest(state)
    );
    const duration = new Date().getTime() - startedAt;
    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }
    return {
      recommendations: fetched.success.results,
      analyticsAction: logRecommendationUpdate(),
      duration,
    };
  }
);

export const buildRecommendationRequest = (
  s: StateNeededByGetRecommendations
): RecommendationRequest => ({
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  url: s.configuration.search.apiBaseUrl,
  recommendation: s.recommendation.id,
  actionsHistory: s.configuration.analytics.enabled
    ? historyStore.getHistory()
    : [],
  ...(s.advancedSearchQueries && {
    aq: s.advancedSearchQueries.aq,
    cq: s.advancedSearchQueries.cq,
  }),
  ...(s.pipeline && {
    pipeline: s.pipeline,
  }),
  ...(s.searchHub && {
    searchHub: s.searchHub,
  }),
  ...(s.context && {
    context: s.context.contextValues,
  }),
  ...(s.fields && {
    fieldsToInclude: s.fields.fieldsToInclude,
  }),
});
