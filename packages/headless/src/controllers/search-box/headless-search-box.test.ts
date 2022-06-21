import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildSearchBox,
} from './headless-search-box';
import {fetchQuerySuggestions} from '../../features/query-suggest/query-suggest-actions';
import {createMockState} from '../../test/mock-state';
import {executeSearch} from '../../features/search/search-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';

describe('headless searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockSearchEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    const options: SearchBoxOptions = {
      id,
      numberOfSuggestions: 10,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '<a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '<i>',
        },
      },
    };

    props = {options};

    initState();
    initController();
  });

  function initState() {
    state = createMockState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({
      id,
      q: 'some value',
      completions: [
        {
          expression: 'a',
          score: 0,
          executableConfidence: 0,
          highlighted: '[hi]{light}(ed)',
        },
      ],
    });
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    searchBox = buildSearchBox(engine, props);
  }

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
    it dispatches fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();

      const action = engine.actions.find(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );
      expect(action).toEqual(
        fetchQuerySuggestions.pending(action!.meta.requestId, {id})
      );
    });

    it(`when numberOfQuerySuggestions is 0,
    it does not dispatch fetchQuerySuggestions`, () => {
      props.options!.numberOfSuggestions = 0;
      initController();

      searchBox.showSuggestions();

      const action = engine.actions.find(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );

      expect(action).toBe(undefined);
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);

      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });
  });

  describe('when calling submit', () => {
    it('it dispatches an executeSearch action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
