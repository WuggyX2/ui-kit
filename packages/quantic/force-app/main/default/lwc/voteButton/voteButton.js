import { LightningElement, api } from 'lwc';
import yes from '@salesforce/label/c.cookbook_Yes';

export default class VoteButton extends LightningElement {
  labels = {
    yes
  }

  /**
   * The label of the button.
   * @api
   * @type {string}
   */
  @api label = this.labels.yes;

  /**
   * The type of the button.
   * @api
   * @type {'positive'|'negative'}
   * @defaultValue `'positive'`
   */
  @api type = 'positive';

  /**
   * The size of the button.
   * @api
   * @type {'small'|'big'}
   * @defaultValue `'small'`
   */
  @api size = 'small';

  /**
   * The state of the button. initial / neutral / selected
   * @api
   * @type {'initial'|'neutral'|'selected'}
   * @defaultValue `'initial'`
   */
  @api state = 'initial';

  /**
   * The name of the icon to be in the button.
   * @api
   * @type {string}
   */
  @api iconName = 'utility:success';

  /**
   * Returns the size of the icon.
   * @returns {string}
   */
  get iconSize() {
    return this.size === 'big' ? 'x-small' : 'xx-small';
  }

  /**
   * Returns the css class of the icon.
   * @returns {string}
   */
  get iconClass() {
    let className = this.size === 'big' ? 'slds-m-right_small' : 'slds-m-right_x-small';
    if (this.state === 'initial') {
      className += ' icon-color_initial';
    }
    return className;
  }

  /**
   * Returns the css class of the label.
   * @returns {string}
   */
  get labelClass() {
    let className = this.size === 'big' ? 'slds-text-heading_small ' : 'label_small ';
    if (this.state === 'neutral') {
      className += 'slds-text-color_weak';
    } else if (this.state === 'initial') {
      className += 'text-color_initial';
    } else if (this.type === "positive") {
      className += 'slds-text-color_success';
    } else {
      className += 'slds-text-color_error';
    }
    return className;
  }

  /**
   * Returns the variant of the icon.
   * @returns {string}
   */
  get iconVariant() {
    if (this.state !== 'selected') {
      return '';
    } else if (this.type === 'positive') {
      return 'success';
    }
    return 'error';
  }

  /**
   * Returns the css class of the container.
   * @returns {string}
   */
  get containerClass(){
    return this.state === 'initial'? 'vote-button clickable':'vote-button';
  }
}