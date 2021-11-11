import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {SearchExpectations} from '../../search-expectations';
import {
  baseFacetExpectations,
  facetWithValuesExpectations,
} from '../facet-common-expectations';
import {
  AllFacetSelectors,
  NumericFacetSelectors,
} from './numeric-facet-selectors';

export const field = 'ytlikecount';

const getEvenRangeValue = (value: any) => {
  const start = Number(value.start);
  const end = Number(value.end);
  return end - start;
};

const numericFacetExpectations = (selector: AllFacetSelectors) => {
  return {
    displaySearchForm: (display: boolean) => {
      selector
        .searchForm()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the 'Manual range' form`);
    },
    inputMinEmpty: () => {
      selector
        .inputMin()
        .invoke('val')
        .should('be.empty')
        .logDetail('the min input should be empty');
    },
    inputMaxEmpty: () => {
      selector
        .inputMax()
        .invoke('val')
        .should('be.empty')
        .logDetail('the max input should be empty');
    },
    inputMinContains: (value: number) => {
      selector
        .inputMin()
        .should('have.value', value.toLocaleString())
        .logDetail(`the input min should contain "${value}"`);
    },
    inputMaxContains: (value: number) => {
      selector
        .inputMax()
        .should('have.value', value.toLocaleString())
        .logDetail(`the input max should contain "${value}"`);
    },
    displayInputWarning: (length: number) => {
      selector
        .inputInvalid()
        .should('have.length', length)
        .logDetail(
          'should display the correct warning when user click Apply button'
        );
    },
    inputWarningContains: (message?: string) => {
      selector
        .helpMessage()
        .should('contain', message ? message : 'Complete this field.')
        .logDetail(
          `the input warning should contain "${
            message ? message : 'Complete this field.'
          }"`
        );
    },
    urlHashContains: (value: string, fromInput = false) => {
      const input = fromInput ? '_input' : '';
      const urlHash = `#nf[${field.toLowerCase()}${input}]=${encodeURI(value)}`;
      cy.url()
        .should('include', urlHash)
        .logDetail(`the URL hash should contain the range "${value}"`);
    },
    displayEqualRange: () => {
      cy.wait(InterceptAliases.Search).then((interception) => {
        const values = interception.response?.body.facets[0].values;
        const fixedRange = getEvenRangeValue(values[0]);
        values.forEach((element: any) => {
          expect(getEvenRangeValue(element)).to.eq(fixedRange);
        });
      });
    },
    logNumericFacetSelect: (value: string) => {
      cy.wait(InterceptAliases.UA.Facet.Select)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
          expect(analyticsBody.facetState[0]).to.have.property(
            'state',
            'selected'
          );
          expect(analyticsBody.facetState[0]).to.have.property('field', field);

          expect(analyticsBody.customData).to.have.property(
            'facetValue',
            value
          );
        })
        .logDetail('should log the "facetSelect" UA event');
    },
  };
};
export const NumericFacetExpectations = {
  ...baseFacetExpectations(NumericFacetSelectors),
  ...numericFacetExpectations(NumericFacetSelectors),
  ...facetWithValuesExpectations(NumericFacetSelectors),
  search: {
    ...SearchExpectations,
  },
};