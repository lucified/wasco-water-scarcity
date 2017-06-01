import * as React from 'react';

import { WaterDatum } from '../../types';
import { toMidpoint } from '../../utils';

import LineChart, { Data } from '../generic/line-chart';

interface PassedProps {
  data: WaterDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
}

type Props = PassedProps;

class StressLineChart extends React.Component<Props, void> {
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
    ];

    return <LineChart data={chartData} width={500} height={400} />;
  }
}

export default StressLineChart;
