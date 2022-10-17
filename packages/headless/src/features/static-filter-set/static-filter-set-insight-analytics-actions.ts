import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {LogStaticFilterToggleValueActionCreatorPayload} from './static-filter-set-actions';

export const logInsightStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
) =>
  makeInsightAnalyticsAction(
    'analytics/staticFilter/deselect',
    AnalyticsType.Search,
    (client, state) =>
      client.logStaticFilterDeselect({
        ...metadata,
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  )();