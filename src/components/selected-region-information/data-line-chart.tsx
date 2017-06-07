import { scaleThreshold } from 'd3-scale';
import some = require('lodash/some');
import * as React from 'react';

import { DataType, StressShortageDatum } from '../../types';

import LineChart, { Data } from '../generic/line-chart';

const styles = require('./data-line-chart.scss');

interface PassedProps {
  dataType: DataType;
  dataLabel?: string;
  dataColor: string;
  thresholds?: number[];
  thresholdColors?: string[];
  yAxisLabel?: string;
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
}

type Props = PassedProps;

export default function ShortageLineChart({
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
  const chartData: Data = {
    label: dataLabel,
    color: dataColor,
    series: data.map(d => ({
      value: d[dataType],
      start: new Date(d.startYear, 0, 1),
      end: new Date(d.endYear, 11, 31),
    })),
  };
  let backgroundColorScale;
  if (thresholds && thresholdColors) {
    backgroundColorScale = scaleThreshold<number, string>()
      .domain(thresholds)
      .range(thresholdColors);
  }

  if (
    some<{ value?: number; start: Date; end: Date }>(
      chartData.series,
      d => d.value == null,
    )
  ) {
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
