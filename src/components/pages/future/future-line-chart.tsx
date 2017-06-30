import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setFutureTimeIndex } from '../../../actions';
import { StateTree } from '../../../reducers';
import {
  getAllFutureTimeSeriesForSelectedWaterRegion,
  getSelectedDataType,
  getSelectedFutureTimeIndex,
  getSelectedWaterRegionId,
  getThresholdsForDataType,
} from '../../../selectors';
import {
  getDataTypeColors,
  StressShortageDatum,
  waterPropertySelector,
} from '../../../types';

import LineChart, { Data } from '../../generic/line-chart';
import Spinner from '../../generic/spinner';

const styles = require('./future-line-chart.scss');

interface GeneratedDispatchProps {
  onTimeIndexChange: (value: number) => void;
}

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedDataType?: 'stress' | 'shortage';
  selectedWaterRegionId?: number;
  data?: Array<{
    id: string;
    data: StressShortageDatum[];
  }>;
  thresholds: number[];
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function FutureLineChart({
  data,
  selectedDataType,
  thresholds,
  selectedTimeIndex,
  selectedWaterRegionId,
  onTimeIndexChange,
}: Props) {
  if (!selectedDataType || selectedWaterRegionId == null) {
    return <div className={styles.empty}>Select a unit</div>;
  }

  if (!data) {
    return <Spinner />;
  }

  const selector = waterPropertySelector(selectedDataType);
  const chartData: Data[] = data.map(series => ({
    id: series.id,
    color: 'blue',
    series: series.data.map(d => ({
      value: selector(d)!,
      start: new Date(d.startYear, 0, 1),
      end: new Date(d.endYear, 11, 31),
    })),
  }));

  const thresholdColors =
    selectedDataType === 'shortage'
      ? ['none', ...getDataTypeColors('shortage')].reverse()
      : ['none', ...getDataTypeColors('stress')];

  const backgroundColorScale = scaleThreshold<number, string>()
    .domain(thresholds)
    .range(thresholdColors);

  return (
    <LineChart
      className={styles.chart}
      data={chartData}
      width={400}
      height={180}
      selectedTimeIndex={selectedTimeIndex}
      onHover={onTimeIndexChange}
      backgroundColorScale={backgroundColorScale}
      marginRight={0}
      marginTop={15}
      marginLeft={40}
    />
  );
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const selectedDataType = getSelectedDataType(state);

  return {
    selectedTimeIndex: getSelectedFutureTimeIndex(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedDataType:
      selectedDataType === 'scarcity' ? undefined : selectedDataType,
    data: getAllFutureTimeSeriesForSelectedWaterRegion(state),
    thresholds: getThresholdsForDataType(state, selectedDataType),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    onTimeIndexChange: (value: number) => {
      dispatch(setFutureTimeIndex(value));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(FutureLineChart);
