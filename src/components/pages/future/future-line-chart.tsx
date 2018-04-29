// import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import { setFutureTimeIndex, toggleFutureScenarioLock } from '../../../actions';
import { FutureScenarioWithData /*, getDataTypeColors */ } from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getDataExtentForAllScenariosInSelectedFutureDataset,
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
import { CanvasLineChart, Series } from '../../generic/canvas-line-chart';
import { theme } from '../../theme';

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
  dataValueExtent?: [number, number];
  chartData?: Series[];
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

const getChartData = createSelector(
  getFilteredScenariosInSelectedFutureDataset,
  filteredData =>
    filteredData &&
    filteredData.map(series => ({
      id: series.scenarioId,
      color: theme.colors.blueAalto,
      points: series.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    })),
);

function FutureLineChart({
  dataValueExtent,
  chartData,
  selectedDataType,
  // thresholds,
  selectedFutureDataForScenario,
  // selectedTimeIndex,
  selectedWaterRegionId,
  // onTimeIndexChange,
  // onLineHover,
  // onToggleLock,
  // futureScenarioLocked,
  width,
  height,
}: Props) {
  if (!selectedDataType || selectedWaterRegionId == null) {
    return <Empty>Select an area on the map</Empty>;
  }

  if (!dataValueExtent || !chartData || !selectedFutureDataForScenario) {
    return null;
  }

  // const thresholdColors =
  //   selectedDataType === 'shortage'
  //     ? ['none', ...getDataTypeColors('shortage')].reverse()
  //     : ['none', ...getDataTypeColors('stress')];

  // const backgroundColorScale = scaleThreshold<number, string>()
  //   .domain(thresholds)
  //   .range(thresholdColors);

  return (
    <CanvasLineChart
      data={chartData}
      width={width || 600}
      height={height || 240}
    />
  );
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(
  state => {
    const selectedDataType = getSelectedHistoricalDataType(state);

    return {
      selectedTimeIndex: getSelectedFutureTimeIndex(state),
      selectedWaterRegionId: getSelectedWaterRegionId(state),
      selectedDataType: getSelectedFutureDataType(state),
      dataValueExtent: getDataExtentForAllScenariosInSelectedFutureDataset(
        state,
      ),
      chartData: getChartData(state),
      selectedFutureDataForScenario: getEnsembleDataForSelectedFutureScenario(
        state,
      ),
      thresholds: getThresholdsForDataType(state, selectedDataType),
      futureScenarioLocked: isFutureScenarioLocked(state),
    };
  },
  dispatch => ({
    onTimeIndexChange: (value: number) => {
      dispatch(setFutureTimeIndex(value));
    },
    onToggleLock: () => {
      dispatch(toggleFutureScenarioLock());
    },
  }),
)(FutureLineChart);
