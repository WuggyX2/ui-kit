import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultNumber/Format/Unit',
  'atomic-format-unit',
  {
    unit: 'byte',
  },
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
    parentElement: () => {
      const resultNumberElement = document.createElement(
        'atomic-result-number'
      );
      resultNumberElement.setAttribute('field', 'size');
      return resultNumberElement;
    },
  }
);

export default defaultModuleExport;
export const DefaultFormatUnit = exportedStory;
