import * as React from 'react';

import { WaterDatum } from '../../types';

import LineChart, { Data } from '../generic/line-chart';

interface PassedProps {
  data: WaterDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
}

type Props = PassedProps;

function toMidpoint(startYear: number, endYear: number): Date {
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);

  return new Date((endDate.getTime() + startDate.getTime()) / 2);
}

class StressShortageChart extends React.Component<Props, void> {
  public shouldComponentUpdate(nextProps: Props) {
    return nextProps.data !== this.props.data ||
      nextProps.selectedTimeIndex !== this.props.selectedTimeIndex;
  }

  public render() {
    const { data } = this.props;
    const chartData: Data[] = [
      {
        label: 'Stress',
        color: 'red',
        series: data.map(d => ({ value: d.blueWaterStress, date: toMidpoint(d.startYear, d.endYear) })),
      },
      {
        label: 'Shortage',
        color: 'blue',
        series: data.map(d => ({ value: d.blueWaterShortage, date: toMidpoint(d.startYear, d.endYear) })),
      },
    ];

    return <LineChart data={chartData} width={500} height={400} />;
  }
}

export default StressShortageChart;
