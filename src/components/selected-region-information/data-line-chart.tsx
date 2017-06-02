import { scaleThreshold } from 'd3-scale';
import some = require('lodash/some');
import * as React from 'react';

import { DataType, WaterDatum } from '../../types';
import { toMidpoint } from '../../utils';

import LineChart, { Data } from '../generic/line-chart';

interface PassedProps {
  dataType: DataType;
  dataLabel: string;
  dataColor: string;
  thresholds?: number[];
  thresholdColors?: string[];
  yAxisLabel: string;
  data: WaterDatum[];
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
    series: data.map(d => ({ value: d[dataType], date: toMidpoint(d.startYear, d.endYear) })),
  };
  let backgroundColorScale;
  if (thresholds && thresholdColors) {
    backgroundColorScale = scaleThreshold<number, string>()
      .domain(thresholds)
      .range(thresholdColors);
  }

  if (some<{ value?: number; date: Date }>(chartData.series, d => d.value == null)) {
    console.warn(`Missing ${dataType} data for selected region`);
    return null;
  }

  return (
    <LineChart
      data={chartData}
      width={270}
      height={120}
      yAxisLabel={yAxisLabel}
      annotationLineIndex={selectedTimeIndex}
      onHover={onTimeIndexChange}
      backgroundColorScale={backgroundColorScale}
      marginRight={0}
      marginTop={5}
      marginLeft={40}
    />
  );
}
