import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactSlider from 'react-slider';
import { Dispatch } from 'redux';

import { setThresholdsForDataType } from '../actions';
import { StateTree } from '../reducers';
import { getThresholdsForDataType } from '../selectors';

const styles = require('./threshold-selector.scss');

interface PassedProps {
  dataType: 'stress' | 'shortage';
}

interface GeneratedStateProps {
  thresholds: number[];
}

interface GeneratedDispatchProps {
  setThresholds: (values: number[]) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

function ThresholdSelector({ thresholds, setThresholds }: Props) {
  // ReactSlider modifies the contents of the values array. We need to clone it
  return (
    <ReactSlider
      min={0}
      max={Math.max(...thresholds) * 2}
      value={thresholds.slice()}
      minDistance={0.01}
      pearling
      step={0.01}
      withBars
      snapDragDisabled
      handleClassName={styles.handle}
      handleActiveClassName={styles.active}
      barClassName={styles.bar}
      className={styles.slider}
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
