// import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import styled from 'styled-components';
// import { FutureScenarioWithData /*, getDataTypeColors */ } from '../../../data';
import { FutureDataType } from '../../../types';
import { CanvasLineChart, Series } from '../../generic/canvas-line-chart';
import responsive from '../../generic/responsive';
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

interface PassedProps {
  selectedTimeIndex: number;
  selectedDataType: FutureDataType;
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  dataValueExtent?: [number, number];
  chartData?: Series[];
  // selectedFutureDataForScenario?: FutureScenarioWithData;
  thresholds: number[];
  onTimeIndexChange: (value: number) => void;
  width?: number;
  height?: number;
}

type Props = PassedProps;

// const getChartData = createSelector(
//   getFilteredScenariosInSelectedFutureDataset,
//   filteredData =>
//     filteredData &&
//     filteredData.map(series => ({
//       id: series.scenarioId,
//       color: theme.colors.blueAalto,
//       points: series.data.map(d => ({
//         value: d.value,
//         time: new Date((d.y0 + d.y1) / 2, 0),
//       })),
//     })),
// );

function FutureLineChart({
  dataValueExtent,
  chartData,
  // selectedDataType,
  // thresholds,
  // selectedFutureDataForScenario,
  // selectedTimeIndex,
  selectedWaterRegionId,
  selectedWorldRegionId,
  // onTimeIndexChange,
  width,
  height,
}: Props) {
  if (selectedWaterRegionId == null && selectedWorldRegionId == null) {
    return <Empty>Select an area on the map</Empty>;
  }

  if (!dataValueExtent || !chartData) {
    return null;
  }

  // const thresholdColors =
  //   selectedDataType === 'shortage'
  //     ? ['none', ...getDataTypeColors('shortage')].reverse()
  //     : ['none', ...getDataTypeColors('stress')];

  return (
    <CanvasLineChart
      data={chartData}
      width={width || 600}
      height={height || 240}
    />
  );
}

export default responsive(FutureLineChart);
