import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactSlider from 'react-slider';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedDataType,
  getSelectedTimeIndex,
  getTimeSeriesForSelectedGlobalRegion,
} from '../selectors';
import { AggregateStressShortageDatum, DataType } from '../types';

const styles = require('./threshold-selector.scss');

interface GeneratedStateProps {
  selectedIndex: number;
  currentIndexLabel: string;
  data: AggregateStressShortageDatum[];
  dataType: DataType;
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function ThresholdSelector(_props: Props) {
  return (
    <ReactSlider
      min={0}
      max={10}
      defaultValue={[2, 5, 7]}
      minDistance={1}
      pearling
      step={1}
      withBars
      snapDragDisabled
      handleClassName={styles.handle}
      handleActiveClassName={styles.active}
      barClassName={styles.bar}
      className={styles.slider}
    />
  );
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const data = getTimeSeriesForSelectedGlobalRegion(state);
  const selectedIndex = getSelectedTimeIndex(state);
  const currentSelectedData = data[selectedIndex];
  const label = currentSelectedData.startYear !== currentSelectedData.endYear
    ? `${currentSelectedData.startYear} - ${currentSelectedData.endYear}`
    : String(currentSelectedData.startYear);

  return {
    selectedIndex,
    currentIndexLabel: label,
    data,
    dataType: getSelectedDataType(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedTime: (value: number) => {
      dispatch(setTimeIndex(value));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(ThresholdSelector);
