import { extent } from 'd3-array';
import { scaleThreshold } from 'd3-scale';
import flattenDeep = require('lodash/flattenDeep');
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import { setFutureTimeIndex, toggleFutureScenarioLock } from '../../../actions';
import {
  FutureEnsembleData,
  FutureScenarioWithData,
  getDataTypeColors,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getEnsembleDataForSelectedFutureScenario,
  getFilteredScenariosInSelectedFutureDataset,
  getSelectedFutureDataType,
  getSelectedFutureTimeIndex,
  getSelectedHistoricalDataType,
  getSelectedWaterRegionId,
  getThresholdsForDataType,
  isFutureScenarioLocked,
} from '../../../selectors';
import { FutureDataType } from '../../../types';
import LineChart, { Data } from '../../generic/line-chart';
import { theme } from '../../theme';

const Chart = styled(LineChart)`
  overflow: visible !important;
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 243px;
  font-weight: 200;
  font-family: ${theme.labelFontFamily};
  color: ${theme.colors.gray};
`;

interface GeneratedDispatchProps {
  onTimeIndexChange: (value: number) => void;
  onToggleLock: () => void;
}

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedDataType: FutureDataType;
  selectedWaterRegionId?: number;
  data?: FutureEnsembleData;
  filteredData?: FutureEnsembleData;
  selectedFutureDataForScenario?: FutureScenarioWithData;
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
    return <Empty>Select an area on the map</Empty>;
  }

  if (!data || !filteredData || !selectedFutureDataForScenario) {
    return null;
  }

  const dataValueExtent = extent(
    flattenDeep<number>(data.map(d => d.data.map(c => c.value))),
  );

  const chartData: Data[] = filteredData.map(series => ({
    id: series.scenarioId,
    color: 'darkcyan',
    series: series.data.map(d => ({
      value: d.value,
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
    <Chart
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
  const selectedDataType = getSelectedHistoricalDataType(state);

  return {
    selectedTimeIndex: getSelectedFutureTimeIndex(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedDataType: getSelectedFutureDataType(state),
    data: getAllScenariosInSelectedFutureDataset(state),
    filteredData: getFilteredScenariosInSelectedFutureDataset(state),
    selectedFutureDataForScenario: getEnsembleDataForSelectedFutureScenario(
      state,
    ),
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
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(FutureLineChart);
