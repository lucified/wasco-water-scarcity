import * as React from 'react';

declare class ReactSlider extends React.Component<ReactSliderProps, any> {}

interface ReactSliderProps {
  /**
   * The minimum value of the slider.
   */
  min?: number;
  /**
   * The maximum value of the slider.
   */
  max?: number;
  /**
   * Value to be added or subtracted on each step the slider makes. Must be
   * greater than zero. max - min should be evenly divisible by the step value.
   */
  step?: number;
  /**
   * The minimal distance between any pair of handles. Zero means they can sit
   * on top of each other.
   */
  minDistance?: number;
  /**
   * Determines the initial positions of the handles and the number of handles
   * if the component has no children. If a number is passed a slider with one
   * handle will be rendered. If an array is passed each value will determine
   * the position of one handle. The values in the array must be sorted.
   * If the component has children, the length of the array must match the
   * number of children.
   *
   * NOTE! This modifies the array contents directly. Copy the array if you're
   * passing in data from Redux.
   */
  defaultValue?: number | number[];
  /**
   * Like defaultValue but for controlled components.
   *
   * NOTE! This modifies the array contents directly. Copy the array if you're
   * passing in data from Redux.
   */
  value?: number | number[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  /**
   * The css class set on each handle node. In addition each handle will receive
   * a numbered css class of the form ${handleClassName}-${i},
   * e.g. handle-0, handle-1, ...
   */
  handleClassName?: string;
  /**
   * The css class set on the handle that is currently being moved.
   */
  handleActiveClassName?: string;
  /**
   * If true bars between the handles will be rendered.
   */
  withBars?: boolean;
  /**
   * The css class set on the bars between the handles. In addition bar fragment
   * will receive a numbered css class of the form ${barClassName}-${i},
   * e.g. bar-0, bar-1, ...
   */
  barClassName?: string;
  /**
   * If true the active handle will push other handles within the constraints
   * of min, max, step and minDistance.
   */
  pearling?: boolean;
  /**
   * If true the handles can't be moved.
   */
  disabled?: boolean;
  /**
   * Disables handle move when clicking the slider bar.
   */
  snapDragDisabled?: boolean;
  /**
   * Inverts the slider.
   */
  invert?: boolean;
  /**
   * Callback called before starting to move a handle.
   */
  onBeforeChange?: () => void;
  /**
   * Callback called on every value change.
   *
   * NOTE! The component modifies the contents of the passed in array. Copy the
   * array if you're storing it in Redux.
   */
  onChange?: (val: number | number[]) => void;
  /**
   * Callback called only after moving a handle has ended or when a new value is
   * set by clicking on the slider.
   */
  onAfterChange?: () => void;
  /**
   * Callback called when the the slider is clicked (handle or bars). Receives
   * the value at the clicked position as argument.
   *
   * NOTE! The component modifies the contents of the passed in array. Copy the
   * array if you're storing it in Redux.
   */
  onSliderClick?: (val: number | number[]) => void;
}

declare var ReactSliderType: typeof ReactSlider;
export = ReactSliderType;
