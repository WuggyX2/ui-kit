const mockGetHistory = jest.fn();
import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';

import {buildMockResult, createMockState} from '../../test';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockFacetValue} from '../../test/mock-facet-value';
import {buildMockQueryState} from '../../test/mock-query-state';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  configureAnalytics,
  getPageID,
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from './search-analytics';

jest.mock('coveo.analytics', () => {
  const originalModule = jest.requireActual('coveo.analytics');
  return {
    ...originalModule,
    history: {
      HistoryStore: jest.fn().mockImplementation(() => {
        return {
          getHistory: mockGetHistory,
        };
      }),
    },
  };
});

describe('search analytics', () => {
  const logger = pino({level: 'silent'});
  it('should be enabled by default', () => {
    const state = createMockState();
    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = true;

    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = false;
    expect(
      configureAnalytics({state, logger}).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(false);
  });

  it('should extract pageId from last page view in action history', () => {
    [
      {
        in: [
          {name: 'PageView', value: 'foo'},
          {name: 'PageView', value: 'bar'},
        ],
        out: 'bar',
      },
      {
        in: [
          {name: 'PageView', value: 'foo'},
          {name: 'not a page view', value: 'qwerty'},
          {name: 'PageView', value: 'bar'},
          {name: 'not a page view', value: 'azerty'},
        ],
        out: 'bar',
      },
      {
        in: [],
        out: '',
      },
      {
        in: [
          {name: 'not a page view', value: 'qwerty'},
          {name: 'not a page view', value: 'azerty'},
        ],
        out: '',
      },
      {
        in: [
          {name: 'pageview', value: 'qwerty'},
          {name: 'pageView', value: 'azerty'},
        ],
        out: '',
      },
    ].forEach((expectation) => {
      mockGetHistory.mockReturnValueOnce(expectation.in);
      expect(getPageID()).toEqual(expectation.out);
    });
  });

  describe('search analytics provider', () => {
    const getBaseState = (): StateNeededBySearchAnalyticsProvider => ({
      configuration: getConfigurationInitialState(),
    });

    it('should properly return the pipeline from the state', () => {
      const state = getBaseState();
      state.pipeline = 'foo';
      expect(new SearchAnalyticsProvider(state).getPipeline()).toBe('foo');
    });

    it('should properly return the pipeline from the reponse if not available directly from state', () => {
      const state = getBaseState();
      state.pipeline = undefined;
      state.search = buildMockSearchState({});
      state.search.response.pipeline = 'foo';
      expect(new SearchAnalyticsProvider(state).getPipeline()).toBe('foo');
    });

    it('should properly return facet state', () => {
      const state = getBaseState();
      state.facetSet = {the_facet: buildMockFacetRequest({field: 'foo'})};
      state.search = buildMockSearchState({});
      state.search.response.facets = [
        buildMockFacetResponse({
          field: 'foo',
          values: [buildMockFacetValue({state: 'selected'})],
        }),
      ];

      expect(new SearchAnalyticsProvider(state).getFacetState()[0].field).toBe(
        'foo'
      );
    });

    it('should properly return getSearchEventRequestPayload', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.results = [
        buildMockResult(),
        buildMockResult(),
        buildMockResult(),
      ];
      state.query = buildMockQueryState({q: 'foo'});
      expect(
        new SearchAnalyticsProvider(state).getSearchEventRequestPayload()
      ).toMatchObject({
        queryText: 'foo',
        responseTime: 0,
        results: expect.any(Array),
        numberOfResults: 3,
      });
    });

    it('should properly return getSearchUID from searchResponseId if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({searchResponseId: 'the_id'});
      state.search.response.searchUid = 'another_id';
      expect(new SearchAnalyticsProvider(state).getSearchUID()).toEqual(
        'the_id'
      );
    });

    it('should properly return getSearchUID from response.searchUid if available', () => {
      const state = getBaseState();
      state.search = buildMockSearchState({});
      state.search.response.searchUid = 'another_id';
      expect(new SearchAnalyticsProvider(state).getSearchUID()).toEqual(
        'another_id'
      );
    });
  });
});