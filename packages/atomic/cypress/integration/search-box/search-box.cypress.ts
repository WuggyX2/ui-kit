import {TestFixture} from '../../fixtures/test-fixture';
import {
  SafeStorage,
  StorageItems,
} from '../../../src/utils/local-storage-utils';
import {SearchBoxSelectors} from './search-box-selectors';
import {addSearchBox} from './search-box-actions';
import * as CommonAssertions from '../common-assertions';
import * as SearchBoxAssertions from './search-box-assertions';
import {addQuerySummary} from '../query-summary-actions';
import * as QuerySummaryAssertions from '../query-summary-assertions';

const setSuggestions = (count: number) => () => {
  cy.intercept(
    {method: 'POST', path: '**/rest/search/v2/querySuggest?*'},
    (request) => {
      request.reply((response) => {
        const newResponse = response.body;
        newResponse.completions = Array.from({length: count}, (_, i) => ({
          expression: `query-suggestion-${i}`,
          executableConfidence: 0,
          highlighted: `Suggestion ${i}`,
          score: 0,
        }));
        response.send(200, newResponse);
      });
    }
  ).as(TestFixture.interceptAliases.QuerySuggestions.substring(1));
};

const setRecentQueries = (count: number) => () => {
  new SafeStorage().setJSON(
    StorageItems.RECENT_QUERIES,
    Array.from({length: count}, (_, i) => `Recent query ${i}`)
  );
};

describe('Search Box Test Suites', () => {
  describe('with maxWithoutQuery capping suggestions & recentQueries', () => {
    const numOfSuggestions = 6;
    const numOfRecentQueries = 4;
    const maxSuggestionsWithoutQuery = numOfSuggestions - 1;
    const maxRecentQueriesWithoutQuery = numOfRecentQueries - 1;

    function setupWithSuggestionsAndRecentQueries() {
      new TestFixture()
        .with(setSuggestions(numOfSuggestions))
        .with(setRecentQueries(numOfRecentQueries))
        .with(
          addSearchBox({
            suggestions: {
              maxWithoutQuery: maxSuggestionsWithoutQuery,
              maxWithQuery: numOfSuggestions,
            },
            recentQueries: {
              maxWithoutQuery: maxRecentQueriesWithoutQuery,
              maxWithQuery: numOfRecentQueries,
            },
            props: {
              'number-of-queries': numOfSuggestions + numOfRecentQueries,
              'suggestion-timeout': 2000,
            },
          })
        )
        .init();
    }

    describe('without input', () => {
      const expectedSum =
        maxSuggestionsWithoutQuery + maxRecentQueriesWithoutQuery;

      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().click();
      });

      SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
      CommonAssertions.assertAriaLiveMessage(expectedSum.toString());
    });

    describe('with input', () => {
      const expectedSum = numOfSuggestions + numOfRecentQueries;

      function setInputText() {
        SearchBoxSelectors.inputBox().type('Rec');
      }

      describe('verify rendering', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();
          setInputText();
        });

        SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
        CommonAssertions.assertAriaLiveMessage(expectedSum.toString());
      });

      describe('after selecting a suggestion with the mouse', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();
          setInputText();
          SearchBoxSelectors.querySuggestions().eq(1).click();
        });

        SearchBoxAssertions.assertFocusSearchBox();
        SearchBoxAssertions.assertHasText('Recent query 1');
      });

      describe('after focusing a suggestion with the keyboard', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();

          SearchBoxSelectors.inputBox().focus();
          const downKeys = Array(9).fill('{downarrow}').join('');
          SearchBoxSelectors.inputBox().type(`Rec${downKeys}`, {
            delay: 200,
            force: true,
          });
        });

        SearchBoxAssertions.assertHasText('Recent query 1');

        describe('after pressing the search button', () => {
          before(() => {
            SearchBoxSelectors.submitButton().click();
          });

          SearchBoxAssertions.assertHasText('Recent query 1');
        });
      });
    });
  });

  describe('with no suggestions nor recentQueries', () => {
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(0))
        .with(setRecentQueries(0))
        .with(addSearchBox())
        .init();
      SearchBoxSelectors.inputBox().click();
    });

    CommonAssertions.assertAriaLiveMessage(' no ');
  });

  describe('with disableSearch set to true', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({props: {'disable-search': 'true'}}))
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
      SearchBoxSelectors.inputBox().click();
      SearchBoxSelectors.inputBox().type('test{enter}', {force: true});
      SearchBoxSelectors.submitButton().click({force: true});
    });

    SearchBoxAssertions.assertHasSuggestionsCount(0);
    SearchBoxAssertions.assertHasText('test');
    QuerySummaryAssertions.assertHasPlaceholder();
  });
});