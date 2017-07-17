import { scaleThreshold } from 'd3-scale';
import * as React from 'react';

import { StressShortageDatum } from '../../types';

import LineChart, { Data } from '../generic/line-chart';

const styles = require('./data-line-chart.scss');

interface PassedProps {
  dataType: 'shortage' | 'stress';
  dataColor: string;
  thresholds: number[];
  thresholdColors: string[];
  yAxisLabel?: string;
  id: string;
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
}

type Props = PassedProps;

export default function DataLineChart({
  data,
  dataType,
  dataColor,
  id,
  thresholds,
  thresholdColors,
  yAxisLabel,
  selectedTimeIndex,
  onTimeIndexChange,
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
    <LineChart
      className={styles.chart}
      data={chartData}
      width={400}
      height={180}
      yAxisLabel={yAxisLabel}
      selectedDataSeries={id}
      selectedTimeIndex={selectedTimeIndex}
      onChartHover={onTimeIndexChange}
      backgroundColorScale={backgroundColorScale}
      marginRight={0}
      marginTop={15}
      marginLeft={40}
    />
  );
}
