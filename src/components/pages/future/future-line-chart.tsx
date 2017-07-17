import { extent } from 'd3-array';
import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import flattenDeep = require('lodash/flattenDeep');

import { setFutureTimeIndex } from '../../../actions';
import { FutureData, FutureDataForModel } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getFilteredSelectedFutureDatasetData,
  getSelectedDataType,
  getSelectedFutureDataForScenario,
  getSelectedFutureDatasetData,
  getSelectedFutureTimeIndex,
  getSelectedWaterRegionId,
  getThresholdsForDataType,
} from '../../../selectors';
import { getDataTypeColors } from '../../../types';

import LineChart, { Data } from '../../generic/line-chart';

import * as styles from './future-line-chart.scss';

interface GeneratedDispatchProps {
  onTimeIndexChange: (value: number) => void;
}

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedDataType?: 'stress' | 'shortage';
  selectedWaterRegionId?: number;
  data?: FutureData;
  filteredData?: FutureData;
  selectedFutureDataForScenario?: FutureDataForModel;
  thresholds: number[];
}

interface PassedProps {
  onLineHover?: (scenarioId: string) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

function FutureLineChart({
  data,
  filteredData,
  selectedDataType,
  thresholds,
  selectedFutureDataForScenario,
  selectedTimeIndex,
  selectedWaterRegionId,
  onTimeIndexChange,
  onLineHover,
}: Props) {
  if (!selectedDataType || selectedWaterRegionId == null) {
    return <div className={styles.empty}>Select a unit on the map</div>;
  }

  if (!data || !filteredData || !selectedFutureDataForScenario) {
    return null;
  }

  const dataValueExtent = extent(
    flattenDeep<number>(
      data.map(d => d.data.map(c => c.regions[selectedWaterRegionId])),
    ),
  );

  const chartData: Data[] = filteredData.map(series => ({
    id: series.scenarioId,
    color: 'blue',
    series: series.data.map(d => ({
      value: d.regions[selectedWaterRegionId],
      start: new Date(d.y0, 0, 1),
      end: new Date(d.y1, 11, 31),
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
      minY={dataValueExtent[0]}
      maxY={dataValueExtent[1]}
      selectedTimeIndex={selectedTimeIndex}
      selectedDataSeries={selectedFutureDataForScenario.scenarioId}
      onChartHover={onTimeIndexChange}
      onLineHover={onLineHover}
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
    data: getSelectedFutureDatasetData(state),
    filteredData: getFilteredSelectedFutureDatasetData(state),
    selectedFutureDataForScenario: getSelectedFutureDataForScenario(state),
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

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureLineChart);
