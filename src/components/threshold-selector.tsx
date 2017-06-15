import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactSlider from 'react-slider';
import { Dispatch } from 'redux';

import { setThresholdsForDataType } from '../actions';
import { defaultDataTypeThresholdMaxValues } from '../data';
import { StateTree } from '../reducers';
import { getThresholdsForDataType } from '../selectors';

const styles = require('./threshold-selector.scss');

interface PassedProps {
  dataType: 'stress' | 'shortage';
  className?: string;
}

interface GeneratedStateProps {
  thresholds: number[];
}

interface GeneratedDispatchProps {
  setThresholds: (values: number[]) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

const configurations = {
  stress: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.stress,
    step: 0.01,
  },
  shortage: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.shortage,
    step: 10,
  },
};

// TODO: Replace react-slider with https://github.com/airbnb/rheostat ?

function ThresholdSelector({
  className,
  thresholds,
  dataType,
  setThresholds,
}: Props) {
  const { step, min, max } = configurations[dataType];

  // ReactSlider modifies the contents of the values array. We need to clone it
  return (
    <ReactSlider
      min={min}
      max={Math.max(thresholds[thresholds.length - 1] * 1.1, max)}
      value={thresholds.slice()}
      minDistance={step}
      pearling
      step={step}
      withBars
      snapDragDisabled
      handleClassName={styles.handle}
      handleActiveClassName={styles.active}
      barClassName={styles.bar}
      className={classNames(styles.slider, className)}
      onChange={setThresholds}
    />
  );
}

function mapStateToProps(
  state: StateTree,
  ownProps: PassedProps,
): GeneratedStateProps {
  return {
    thresholds: getThresholdsForDataType(state, ownProps.dataType),
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<any>,
  ownProps: PassedProps,
): GeneratedDispatchProps {
  return {
    setThresholds: (values: number[]) => {
      // ReactSlider modifies the contents of the values array
      dispatch(setThresholdsForDataType(ownProps.dataType, values.slice()));
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(ThresholdSelector);
