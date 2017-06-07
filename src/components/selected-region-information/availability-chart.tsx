import { format } from 'd3-format';
import * as React from 'react';

import BarChart, { BarChartDatum } from '../generic/bar-chart';

import { StressShortageDatum } from '../../types';

interface PassedProps {
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
  maxY?: number;
}

type Props = PassedProps;

const yTickFormatter = format('.2s');

export default function AvailabilityChart({
  data,
  // selectedTimeIndex,
  // onTimeIndexChange,
  maxY,
}: Props) {
  const barChartData: BarChartDatum[] = data.map((d, i) => ({
    key: i,
    total: d.blueWaterAvailability,
    values: [
      {
        key: 'Availability',
        total: d.blueWaterAvailability,
        color: 'green',
      },
    ],
  }));

  return (
    <BarChart
      data={barChartData}
      maxYValue={maxY}
      height={120}
      marginBottom={20}
      marginRight={10}
      marginTop={10}
      yTickFormat={yTickFormatter}
    />
  );
}
