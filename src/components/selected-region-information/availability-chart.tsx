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
  selectedTimeIndex,
  onTimeIndexChange,
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

  function handleHover(item: BarChartDatum) {
    onTimeIndexChange(item.key);
  }

  return (
    <BarChart
      data={barChartData}
      maxYValue={maxY}
      height={120}
      marginBottom={20}
      marginRight={0}
      marginTop={5}
      marginLeft={40}
      yTickFormat={yTickFormatter}
      selectedIndex={selectedTimeIndex}
      onMouseOver={handleHover}
    />
  );
}
