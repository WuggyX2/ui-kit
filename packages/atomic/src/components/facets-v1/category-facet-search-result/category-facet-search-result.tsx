import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {CategoryFacetSearchResult as HeadlessCategoryFacetSearchResult} from '@coveo/headless';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';

interface CategoryFacetSearchResultProps {
  result: HeadlessCategoryFacetSearchResult;
  i18n: i18n;
  field: string;
  onClick(): void;
  searchQuery: string;
}

const SEPARATOR = '/';
const ELLIPSIS = '...';
const PATH_MAX_LENGTH = 3;

export const CategoryFacetSearchResult: FunctionalComponent<CategoryFacetSearchResultProps> = ({
  result,
  field,
  i18n,
  onClick,
  searchQuery,
}) => {
  const count = result.count.toLocaleString(i18n.language);
  const inLabel = i18n.t('in');
  const allCategories = i18n.t('all-categories');
  const localizedPath = result.path.length
    ? result.path.map((value) => getFieldValueCaption(field, value, i18n))
    : [allCategories];
  const ariaLabel = i18n.t('under', {
    child: i18n.t('facet-value', {
      numberOfResults: result.count,
      value: result.displayValue,
    }),
    parent: localizedPath.join(', '),
  });

  function ellipsedPath(path: string[]) {
    if (path.length <= PATH_MAX_LENGTH) {
      return path;
    }
    const firstPart = path.slice(0, 1);
    const lastParts = path.slice(-PATH_MAX_LENGTH + 1);
    return firstPart.concat(ELLIPSIS, ...lastParts);
  }

  function renderPath(path: string[]) {
    if (!path.length) {
      return <span class="ellipsed">{`${inLabel} ${allCategories}`}</span>;
    }

    return [
      <span class="mr-0.5">{inLabel}</span>,
      ellipsedPath(path).map((value, index) => [
        index > 0 && <span class="mx-0.5">{SEPARATOR}</span>,
        <span class={value === ELLIPSIS ? '' : 'ellipsed flex-1 max-w-max'}>
          {value}
        </span>,
      ]),
    ];
  }

  return (
    <li key={result.displayValue}>
      <button
        part="search-result"
        onClick={() => onClick()}
        class="search-result w-full flex flex-col py-2.5 text-on-background ellipsed focus:outline-none"
        aria-label={ariaLabel}
      >
        <div class="w-full flex">
          <FacetValueLabelHighlight
            displayValue={result.displayValue}
            isSelected={false}
            searchQuery={searchQuery}
          ></FacetValueLabelHighlight>
          <span
            part="value-count"
            class="ml-1.5 text-neutral-dark with-parentheses"
          >
            {count}
          </span>
        </div>
        <div
          part="search-result-path"
          class="search-result-path flex text-neutral-dark mt-1"
        >
          {renderPath(localizedPath)}
        </div>
      </button>
    </li>
  );
};