
import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import showMore from '@salesforce/label/c.quantic_ShowMore';
import showLess from '@salesforce/label/c.quantic_ShowLess';
import showMoreFacetValues from '@salesforce/label/c.quantic_ShowMoreFacetValues';
import showLessFacetValues from '@salesforce/label/c.quantic_ShowLessFacetValues';
import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import moreMatchesFor from '@salesforce/label/c.quantic_MoreMatchesFor';
import noMatchesFor from '@salesforce/label/c.quantic_NoMatchesFor';

/**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).\
 * A `QuanticFacet` displays a facet of the results for the current query.
 * @category Components
 * @hideconstructor
 * @example
 * <c-quantic-facet field="filetype" label="File Type" engine-id={engineId}></c-quantic-facet>
 */
export default class QuanticFacet extends LightningElement {
  /**
   * @type {import("coveo").FacetState}
   * @ignore
   */
  @track state;
  /**
   * The field whose values you want to display in the facet.
   * @type {string}
   */
  @api field;
  /**
   * The non-localized label for the facet.
   * @type {string}
   */
  @api label;
  /**
   * The ID of the engine instance with which to register.
   * @type {string}
   */
  @api engineId;
  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   * @type {number}
   * @default 8
   */
  @api numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values
   * Possible values are:
   *   - score
   *   - numeric
   *   - occurences
   *   - automatic
   * @type  {import("coveo").FacetSortCriterion}
   * @default automatic
   */
  @api sortCriteria = 'automatic';
  /**
   * Whether this facet should not contain a search box.
   * @type {boolean}
   * @default false
   */
  @api noSearch = false;

  /**
   * @type {import("coveo").Facet}}
   * @ignore
   */
  facet;
  /**
   * @type {import("coveo").Unsubscribe}
   * @ignore
   */
  unsubscribe;
  /**
   * @type {boolean} 
   * @ignore
   */
  isCollapsed = false;
  /**
   * @type {string}
   * @ignore
   */
  collapseIcon = 'utility:dash';
  /**
   * @type {HTMLInputElement}
   * @ignore
   */
  input;
  /**
   * @type {boolean}
   * @ignore
   */
  isFacetSearchActive = false;

  labels = {
    showMore,
    showLess,
    showMoreFacetValues,
    showLessFacetValues,
    clear,
    search,
    moreMatchesFor,
    noMatchesFor,
  };

  /**
   * @param {import("coveo").SearchEngine} engine
   * @ignore
   */
  initialize(engine) {
    const options = {
      field: this.field,
      sortCriteria: this.sortCriteria,
      numberOfValues: Number(this.numberOfValues),
      facetSearch: {numberOfValues: Number(this.numberOfValues)},
    };
    this.facet = CoveoHeadless.buildFacet(engine, {options});
    this.facetId = this.facet.state.facetId;
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    this.input = this.template.querySelector('.facet__searchbox-input');
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.facet.state;
  }

  get values() {
    return (
      this.state?.values
        .filter((value) => value.numberOfResults || value.state === 'selected')
        .map((v) => ({
          ...v,
          checked: v.state === 'selected',
          highlightedResult: v.value,
        })) || []
    );
  }

  get query() {
    return this.input.value;
  }

  get canShowMoreSearchResults() {
    return this.facet?.state.facetSearch.moreValuesAvailable;
  }

  get canShowMore() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowMoreValues;
  }

  get canShowLess() {
    if (!this.facet) {
      return false;
    }
    return this.state.canShowLessValues;
  }

  get hasValues() {
    return this.values.length !== 0;
  }

  get hasActiveValues() {
    return this.state.hasActiveValues;
  }

  get hasSearchResults() {
    return this.facet.state.facetSearch.values.length !== 0;
  }

  get facetSearchResults() {
    const results = this.facet.state.facetSearch.values;
    return results.map((result) => ({
      value: result.rawValue,
      state: 'idle',
      numberOfResults: result.count,
      checked: false,
      highlightedResult: this.highlightResult(
        result.displayValue,
        this.input.value
      ),
    }));
  }

  get isSearchComplete() {
    return !this.facet.state.isLoading;
  }

  get showMoreFacetValuesLabel() {
    return I18nUtils.format(this.labels.showMoreFacetValues, this.label);
  }

  get showLessFacetValuesLabel() {
    return I18nUtils.format(this.labels.showLessFacetValues, this.label);
  }

  get moreMatchesForLabel() {
    return I18nUtils.format(this.labels.moreMatchesFor, this.query);
  }

  get noMatchesForLabel() {
    return I18nUtils.format(this.labels.noMatchesFor, this.query);
  }

  /**
   * @param {CustomEvent<import("coveo").FacetValue>} evt
   * @ignore
   */
  onSelect(evt) {
    const specificSearchResult = {
      displayValue: evt.detail.value,
      rawValue: evt.detail.value,
      count: evt.detail.numberOfResults,
    };
    if (this.isFacetSearchActive) {
      this.facet.facetSearch.select(specificSearchResult);
    } else {
      this.facet.toggleSelect(evt.detail);
    }
    this.clearInput();
    this.isFacetSearchActive = false;
  }

  showMore() {
    this.facet.showMoreValues();
  }

  showLess() {
    this.facet.showLessValues();
  }

  clearSelections() {
    this.facet.deselectAll();
    this.clearInput();
  }

  toggleFacetVisibility() {
    this.collapseIcon = this.isCollapsed ? 'utility:dash' : 'utility:add';
    this.isCollapsed = !this.isCollapsed;
  }

  handleKeyUp() {
    if (this.isSearchComplete) {
      this.isFacetSearchActive = this.input.value !== '';
      this.facet.facetSearch.updateText(this.input.value);
      this.facet.facetSearch.search();
    }
  }

  clearInput() {
    this.input.value = '';
    this.updateState();
  }

  highlightResult(result, query) {
    if (!query || query.trim() === '') {
      return result;
    }
    const regex = new RegExp(`(${this.regexEncode(query)})`, 'i');
    return result.replace(regex, '<b>$1</b>');
  }

  regexEncode(value) {
    return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }
}
