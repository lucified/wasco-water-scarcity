import { format } from 'd3-format';
import { schemeBlues } from 'd3-scale-chromatic';
import * as React from 'react';

import BarChart, { BarChartDatum } from '../generic/bar-chart';
import Legend, { LegendItem } from '../generic/legend';

import { StressShortageDatum } from '../../types';

interface PassedProps {
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
  maxY?: number;
}

type Props = PassedProps;

const yTickFormatter = format('.2s');

const colorScale = schemeBlues[9];
const legendItems: Array<LegendItem & { field: keyof StressShortageDatum }> = [
  {
    title: 'Domestic',
    field: 'blueWaterConsumptionDomestic',
    color: colorScale[8],
  },
  {
    title: 'Electric',
    field: 'blueWaterConsumptionElectric',
    color: colorScale[7],
  },
  {
    title: 'Irrigation',
    field: 'blueWaterConsumptionIrrigation',
    color: colorScale[5],
  },
  {
    title: 'Livestock',
    field: 'blueWaterConsumptionLivestock',
    color: colorScale[3],
  },
  {
    title: 'Manufacturing',
    field: 'blueWaterConsumptionManufacturing',
    color: colorScale[2],
  },
];

export default function AvailabilityChart({
  data,
  // selectedTimeIndex,
  // onTimeIndexChange,
  maxY,
}: Props) {
  const barChartData: BarChartDatum[] = data.map((d, i) => {
    const total =
      d.blueWaterConsumptionDomestic +
      d.blueWaterConsumptionElectric +
      d.blueWaterConsumptionIrrigation +
      d.blueWaterConsumptionLivestock +
      d.blueWaterConsumptionManufacturing;
    return {
      key: i,
      total,
      values: legendItems
        .map(({ title, field, color }) => ({
          key: title,
          total: d[field],
          color,
        }))
        .filter(c => c.total > 0),
    };
  });

  return (
    <div>
      <Legend items={legendItems} />
      <BarChart
        data={barChartData}
        maxYValue={maxY}
        height={120}
        marginBottom={20}
        marginRight={10}
        marginTop={10}
        yTickFormat={yTickFormatter}
      />
    </div>
  );
}
