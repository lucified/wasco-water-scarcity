import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import styled from 'styled-components';
import { StressShortageDatum } from '../../types';
import { formatAxisNumber, formatLabel } from '../../utils';
import LineChart, { Data } from '../generic/line-chart';
import responsive from '../generic/responsive';
import { theme } from '../theme';

const Chart = styled(LineChart)`
  overflow: visible !important;
  font-family: ${theme.labelFontFamily};
`;

interface PassedProps {
  dataType: 'shortage' | 'stress';
  dataColor: string;
  thresholds: number[];
  width: number;
  thresholdColors: string[];
  yAxisLabel?: string;
  id: string;
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
  timeIndexLocked?: boolean;
  onClick?: () => void;
}

type Props = PassedProps;

function DataLineChart({
  data,
  dataType,
  width,
  dataColor,
  id,
  thresholds,
  thresholdColors,
  yAxisLabel,
  selectedTimeIndex,
  onTimeIndexChange,
  onClick,
  timeIndexLocked,
}: Props) {
  const chartData: Data = {
    id,
    color: dataColor,
    series: data.map(d => ({
      value: d[dataType],
      start: new Date(d.startYear, 0, 1),
      end: new Date(d.endYear, 11, 31),
    })),
  };
  const backgroundColorScale = scaleThreshold<number, string>()
    .domain(thresholds)
    .range(thresholdColors);

  if (chartData.series.some(d => d.value == null)) {
    console.warn(`Missing ${dataType} data for selected region`);
    return null;
  }

  return (
    <Chart
      data={chartData}
      width={width}
      height={180}
      yAxisLabel={yAxisLabel}
      yAxisFormatter={formatAxisNumber}
      labelFormatter={formatLabel}
      selectedDataSeries={id}
      selectedTimeIndex={selectedTimeIndex}
      onChartHover={onTimeIndexChange}
      onClick={onClick}
      selectedTimeIndexLocked={timeIndexLocked}
      backgroundColorScale={backgroundColorScale}
      marginRight={0}
      marginTop={15}
      marginLeft={40}
    />
  );
}

export default responsive(DataLineChart);
