import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import { I18nUtils } from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

import expandFacet from '@salesforce/label/c.quantic_ExpandFacet';
import collapseFacet from '@salesforce/label/c.quantic_CollapseFacet';
import clearFilter from '@salesforce/label/c.quantic_ClearFilter';

/** @typedef {import("coveo").DateRangeRequest} DateRangeRequest */
/** @typedef {import("coveo").DateFacetValue} DateFacetValue */

export default class QuanticTimeframeFacet extends LightningElement {
  @api engineId;
  @api facetId;
  @api field;
  @api label = 'no-label';
  @api withDatePicker = false;
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  @api noFilterFacetCount = false;
  @api injectionDepth = 1000;

  @track state;

  searchStatus;
  unsubscribeSearchStatus;
  facet;
  unsubscribe;

  showPlaceholder = true;

  _isCollapsed;

  labels = {
    collapseFacet,
    expandFacet,
    clearFilter,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    this.facet = CoveoHeadless.buildDateFacet(engine, {
      options: {
        field: this.field,
        currentValues: this.currentValues,
        generateAutomaticRanges: false,
        sortCriteria: 'descending',
        filterFacetCount: !this.noFilterFacetCount,
        injectionDepth: this.injectionDepth,
        facetId: this.facetId ?? this.field,
      },
    });
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.facet?.state;
    this.showPlaceholder =
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted;
  }

  /**
   * 
   * @param {DateFacetValue} facetValue 
   */
  formatFacetValue = (facetValue) => {
    const startDate = CoveoHeadless.deserializeRelativeDate(facetValue.start);
    const relativeDate = startDate.period === 'past'
      ? startDate
      : CoveoHeadless.deserializeRelativeDate(facetValue.end);

    const timeframe = this.timeframes?.find((tf) => tf.period === relativeDate.period && tf.unit === relativeDate.unit && tf.amount === relativeDate.amount);

    // TODO: Improve localization of the labels and/or pluralization
    if (timeframe?.label) {
      return timeframe.label;
    }

    return `${relativeDate.period} ${relativeDate.amount} ${relativeDate.unit}`;
  }

  onSelectValue(evt) {
    const item = this.formattedValues.find((value) => value.label === evt.detail.value);
    this.facet.toggleSingleSelect(item);
  }

  toggleFacetVisibility() {
    this._isCollapsed = !this.isCollapsed;
  }

  preventDefault(evt) {
    evt.preventDefault();
  }

  get timeframes() {
    return Array.from(this.querySelectorAll('c-quantic-timeframe')).map(
      (el) => {
        const amount = typeof(el.amount) === 'string'
          ? parseInt(el.amount, 10)
          : el.amount;

        return {
          period: el.period,
          unit: el.unit,
          amount: amount,
          label: el.label,
        };
      }
    );
  }

  /**
   * @type {DateRangeRequest[]}
   */
  get currentValues() {
    return this.timeframes.map((timeframe) => {
      return timeframe.period === 'past'
        ? CoveoHeadless.buildDateRange({
            start: {
              period: timeframe.period,
              unit: timeframe.unit,
              amount: timeframe.amount,
            },
            end: {period: 'now'},
          })
        : CoveoHeadless.buildDateRange({
            start: {period: 'now'},
            end: {
              period: timeframe.period,
              unit: timeframe.unit,
              amount: timeframe.amount,
            },
          });
    });
  }

  get values() {
    if (!this?.state?.values) {
      return [];
    }

    return this.state.values;
  }

  get formattedValues() {
    return this.values.map((value) => ({
      ...value,
      label: this.formatFacetValue(value),
      key: JSON.stringify([value.start, value.end]),
      selected: value.state === 'selected'
    }));
  }

  get actionButtonIcon() {
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonCssClasses() {
    return this.isCollapsed ? 'facet__expand' : 'facet__collapse';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed ? this.labels.expandFacet : this.labels.collapseFacet;
    return I18nUtils.format(label, this.label);
  }

  get hasActiveValues() {
    return this.formattedValues.some((v) => v.selected);
  }

  clearSelections() {
    this.facet.deselectAll();
  }

  get clearFilterLabel() {
    return I18nUtils.format(this.labels.clearFilter);
  }
}
