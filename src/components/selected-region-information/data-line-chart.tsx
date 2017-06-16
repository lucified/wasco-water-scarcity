import { scaleThreshold } from 'd3-scale';
import * as React from 'react';

import { StressShortageDatum, waterPropertySelector } from '../../types';

import LineChart, { Data } from '../generic/line-chart';

const styles = require('./data-line-chart.scss');

interface PassedProps {
  dataType: 'shortage' | 'stress';
  dataLabel?: string;
  dataColor: string;
  thresholds: number[];
  thresholdColors: string[];
  yAxisLabel?: string;
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
}

type Props = PassedProps;

export default function DataLineChart({
  data,
  dataLabel,
  dataType,
  dataColor,
  thresholds,
  thresholdColors,
  yAxisLabel,
  selectedTimeIndex,
  onTimeIndexChange,
}: Props) {
  const selector = waterPropertySelector(dataType);
  const chartData: Data = {
    label: dataLabel,
    color: dataColor,
    series: data.map(d => ({
      value: selector(d)!,
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
      width={270}
      height={120}
      yAxisLabel={yAxisLabel}
      selectedTimeIndex={selectedTimeIndex}
      onHover={onTimeIndexChange}
      backgroundColorScale={backgroundColorScale}
      marginRight={0}
      marginTop={5}
      marginLeft={40}
    />
  );
}
