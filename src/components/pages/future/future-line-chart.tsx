import { extent } from 'd3-array';
import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import flattenDeep = require('lodash/flattenDeep');

import { setFutureTimeIndex, toggleFutureScenarioLock } from '../../../actions';
import {
  FutureData,
  FutureDataForModel,
  getDataTypeColors,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getFilteredScenariosInSelectedFutureDataset,
  getSelectedDataType,
  getSelectedFutureScenario,
  getSelectedFutureTimeIndex,
  getSelectedWaterRegionId,
  getThresholdsForDataType,
  isFutureScenarioLocked,
} from '../../../selectors';

import LineChart, { Data } from '../../generic/line-chart';

import * as styles from './future-line-chart.scss';

interface GeneratedDispatchProps {
  onTimeIndexChange: (value: number) => void;
  onToggleLock: () => void;
}

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedDataType?: 'stress' | 'shortage';
  selectedWaterRegionId?: number;
  data?: FutureData;
  filteredData?: FutureData;
  selectedFutureDataForScenario?: FutureDataForModel;
  thresholds: number[];
  futureScenarioLocked: boolean;
}

interface PassedProps {
  onLineHover?: (scenarioId: string) => void;
  width?: number;
  height?: number;
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
  onToggleLock,
  futureScenarioLocked,
  width,
  height,
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
      width={width || 600}
      height={height || 240}
      minY={dataValueExtent[0]}
      maxY={dataValueExtent[1]}
      selectedTimeIndex={selectedTimeIndex}
      selectedDataSeries={selectedFutureDataForScenario.scenarioId}
      selectedDataSeriesLocked={futureScenarioLocked}
      onChartHover={onTimeIndexChange}
      onLineHover={onLineHover}
      onClick={onToggleLock}
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
    data: getAllScenariosInSelectedFutureDataset(state),
    filteredData: getFilteredScenariosInSelectedFutureDataset(state),
    selectedFutureDataForScenario: getSelectedFutureScenario(state),
    thresholds: getThresholdsForDataType(state, selectedDataType),
    futureScenarioLocked: isFutureScenarioLocked(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    onTimeIndexChange: (value: number) => {
      dispatch(setFutureTimeIndex(value));
    },
    onToggleLock: () => {
      dispatch(toggleFutureScenarioLock());
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureLineChart);
