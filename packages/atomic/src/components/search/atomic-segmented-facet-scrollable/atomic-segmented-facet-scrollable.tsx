import {Component, h, Listen, State} from '@stencil/core';
import ArrowRightIcon from 'coveo-styleguide/resources/icons/svg/arrow-right-rounded.svg';
import ArrowLeftIcon from 'coveo-styleguide/resources/icons/svg/arrow-left-rounded.svg';
import {Button} from '../../common/button';

type ArrowDirection = 'right' | 'left';

/**
 * @internal
 * The 'atomic-segmented-facet-scrollable' component wraps around one or several 'atomic-segmented-facet' to provide horizontal scrolling capabilities.
 * @part scrollable-container - The wrapper for the entire component including the horizontal-scroll container and the arrow buttons.
 * @part horizontal-scroll - The scrollable container for the segmented facets.
 * @part left-arrow-box - The left arrow box containing both the left arrow button and the fade.
 * @part right-arrow-box - The right arrow box containing both the right arrow button and the fade.
 * @part arrow-button - The arrow button used to scroll left or right.
 * @part fade - The white to transparent gradient.
 */

@Component({
  tag: 'atomic-segmented-facet-scrollable',
  styleUrl: 'atomic-segmented-facet-scrollable.pcss',
  shadow: true,
})
export class AtomicSegmentedFacetScrollable {
  private horizontalScroll?: HTMLDivElement;
  @State() private hideLeftArrow = true;
  @State() private hideRightArrow = false;

  @Listen('mousewheel')
  @Listen('resize', {target: 'window'})
  handleScroll() {
    if (!this.horizontalScroll) {
      return;
    }

    const isOverflowing =
      this.horizontalScroll.clientWidth < this.horizontalScroll.scrollWidth;
    const isLeftEdge = this.horizontalScroll?.scrollLeft <= 0;
    const isRightEdge =
      this.horizontalScroll.scrollLeft >=
      this.horizontalScroll.scrollWidth - this.horizontalScroll.clientWidth;

    if (!isOverflowing) {
      this.hideLeftArrow = true;
      this.hideRightArrow = true;
    } else if (isLeftEdge) {
      this.hideLeftArrow = true;
    } else if (isRightEdge) {
      this.hideRightArrow = true;
    } else {
      this.hideLeftArrow = false;
      this.hideRightArrow = false;
    }
  }

  private slideHorizontally(direction: ArrowDirection) {
    const container = this.horizontalScroll;
    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;
    const containerScrollWidth = container.scrollWidth;
    const pixelsToScroll = container ? container.clientWidth * 0.75 : 700;
    this.hideLeftArrow = false;
    this.hideRightArrow = false;

    if (direction === 'left') {
      container.scrollLeft -= pixelsToScroll;
      if (container.scrollLeft - pixelsToScroll <= 0) {
        this.hideLeftArrow = true;
      }
    } else {
      container.scrollLeft += pixelsToScroll;
      if (
        container.scrollLeft + pixelsToScroll >=
        containerScrollWidth - containerWidth
      ) {
        this.hideRightArrow = true;
      }
    }
  }

  private renderArrowClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return 'left-0 ' + (this.hideLeftArrow ? 'hidden' : '');
    } else {
      return 'right-0 ' + (this.hideRightArrow ? 'hidden' : '');
    }
  }

  private renderFadeClass(direction: ArrowDirection) {
    if (direction === 'left') {
      return 'bg-gradient-to-r left-0 ' + (this.hideLeftArrow ? 'hidden' : '');
    } else {
      return (
        'bg-gradient-to-l right-0 ' + (this.hideRightArrow ? 'hidden' : '')
      );
    }
  }

  private renderArrow(direction: ArrowDirection) {
    const isLeft: boolean = direction === 'left';
    return [
      <Button
        part={`${direction}-arrow-button`}
        style="square-neutral"
        class={`flex shrink-0 basis-8 justify-center items-center rounded absolute z-[1] w-10 top-0 bottom-0 ${this.renderArrowClass(
          direction
        )}`}
        ariaHidden="true"
        tabIndex="-1"
        onClick={() => this.slideHorizontally(direction)}
      >
        <atomic-icon
          part={`${direction}-arrow-icon`}
          class="w-3.5"
          icon={isLeft ? ArrowLeftIcon : ArrowRightIcon}
        ></atomic-icon>
      </Button>,
      <div
        part={`${direction}-fade`}
        class={`w-16 h-10 absolute top-0  z-0 pointer-events-none from-background-80 ${this.renderFadeClass(
          direction
        )}`}
      ></div>,
    ];
  }

  render() {
    return (
      <div part="scrollable-container" class="flex h-10 relative">
        {this.renderArrow('left')}
        <div
          part="horizontal-scroll"
          class="wrapper-segmented flex flex-row ml-10 mr-10 overflow-x-scroll scroll-smooth"
          ref={(el) => (this.horizontalScroll = el as HTMLDivElement)}
        >
          <slot></slot>
        </div>
        {this.renderArrow('right')}
      </div>
    );
  }
}