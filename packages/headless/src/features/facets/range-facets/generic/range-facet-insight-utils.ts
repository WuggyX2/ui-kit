import {FacetSelectionChangeMetadata} from '../../facet-set/facet-set-analytics-actions-utils';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../../facet-set/facet-set-insight-analytics-actions';
import {RangeFacetValue} from './interfaces/range-facet';

export const isRangeFacetValueSelected = (selection: RangeFacetValue) => {
  return selection.state === 'selected';
};

export const getInsightAnalyticsActionForToggleRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};
