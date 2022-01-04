import {api, LightningElement} from 'lwc';

export default class ActionSelectResults extends LightningElement {
  @api engineId;
  @api disabled;

  interactiveResult;
  count = 1;

  handle() {
    const result = {
      title: this.count.toString(),
      uri: 'https://github.com/coveo/ui-kit/',
      uniqueId: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 16),
      clickUri: 'https://github.com/coveo/ui-kit/',
      raw: {
        urihash: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 16),
      },
    };
    this.count++;
    this.resolveInteractiveResultController(result).then((controller) => {
      this.interactiveResult = controller;
      this.interactiveResult.select();
    });
  }

  resolveInteractiveResultController(result) {
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return CoveoHeadless.buildInteractiveResult(engine, {
          options: {result: JSON.parse(JSON.stringify(result))},
        });
      }
    );
  }
}
