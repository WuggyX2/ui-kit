import {SearchBoxSelectors} from '../search-box-selectors';

export const InstantResultsSelectors = {
  results: () =>
    SearchBoxSelectors.shadow().find('[part~="instant-results-item"]'),
  showAllButton: () =>
    SearchBoxSelectors.shadow().find('[part~="instant-results-show-all"]'),
};
