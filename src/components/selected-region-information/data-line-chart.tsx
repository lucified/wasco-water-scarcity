import some = require('lodash/some');
import * as React from 'react';

import { DataType, WaterDatum } from '../../types';
import { toMidpoint } from '../../utils';

import LineChart, { Data } from '../generic/line-chart';

interface PassedProps {
  dataType: DataType;
  dataLabel: string;
  dataColor: string;
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
  yAxisLabel,
  selectedTimeIndex,
}: Props) {
  console.log('rendering DataLineChart for');

  const chartData: Data[] = [
    {
      label: dataLabel,
      color: dataColor,
      series: data.map(d => ({ value: d[dataType], date: toMidpoint(d.startYear, d.endYear) })),
    },
  ];
  const selectedData = data[selectedTimeIndex];

  if (some<{ value?: number; date: Date }>(chartData[0].series, d => d.value == null)) {
    console.warn(`Missing ${dataType} data for selected region`);
    return null;
  }

  return (
    <LineChart
      data={chartData}
      width={500}
      height={400}
      yAxisLabel={yAxisLabel}
      annotationLine={toMidpoint(selectedData.startYear, selectedData.endYear)}
    />
  );
}
