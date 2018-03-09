import { format } from 'd3-format';
import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactSlider from 'react-slider';
import { Dispatch } from 'redux';

import { setThresholdsForDataType } from '../actions';
import {
  defaultDataTypeThresholdMaxValues,
  defaultDataTypeThresholds,
} from '../data';
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
  setThresholds: (values: number | number[]) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

const configurations = {
  stress: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.stress,
    step: 0.01,
    formatter: format('.2f'),
  },
  shortage: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.shortage,
    step: 10,
    formatter: format('d'),
  },
};

function getHeaderText(dataType: 'stress' | 'shortage') {
  const text =
    dataType === 'shortage'
      ? 'Available water per capita (m³)'
      : 'Consumption relative to availability';
  return (
    <span>
      <strong>
        {dataType.charAt(0).toUpperCase() + dataType.slice(1)}:
      </strong>{' '}
      {text}
    </span>
  );
}

// TODO: Replace react-slider with https://github.com/airbnb/rheostat ?

function ThresholdSelector({
  className,
  thresholds,
  dataType,
  setThresholds,
}: Props) {
  const { step, min, max, formatter } = configurations[dataType];
  const slidingMax = Math.max(thresholds[thresholds.length - 1] * 1.1, max);

  // ReactSlider modifies the contents of the values array. We need to clone it
  return (
    <div className={className}>
      <div className={styles.header}>
        {getHeaderText(dataType)}
      </div>
      <ReactSlider
        min={min}
        max={slidingMax}
        value={thresholds.slice()}
        minDistance={10 * step}
        pearling
        step={step}
        withBars
        snapDragDisabled
        handleClassName={styles.handle}
        handleActiveClassName={styles.active}
        barClassName={dataType === 'stress' ? 'bar-stress' : 'bar-shortage'}
        className={styles.slider}
        onChange={setThresholds}
      />
      <div className={styles.labels}>
        {thresholds.map((d, i) =>
          <span
            className={styles.label}
            style={{ left: `${(d - min) / (slidingMax - min) * 100}%` }}
            key={`${dataType}-threshold-label-${i}`}
          >
            {formatter(d)}
          </span>,
        )}
      </div>
      <div className={styles.reset}>
        <span
          className={styles['reset-link']}
          onClick={() => {
            setThresholds(defaultDataTypeThresholds[dataType]);
          }}
        >
          Reset
        </span>
      </div>
    </div>
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
    setThresholds: (values: number[] | number) => {
      // ReactSlider modifies the contents of the values array
      const thresholds = Array.isArray(values) ? values.slice() : [values];
      dispatch(setThresholdsForDataType(ownProps.dataType, thresholds));
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(ThresholdSelector);
