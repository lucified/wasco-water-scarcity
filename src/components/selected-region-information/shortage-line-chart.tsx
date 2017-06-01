import some = require('lodash/some');
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

class ShortageLineChart extends React.Component<Props, void> {
  public shouldComponentUpdate(nextProps: Props) {
    return nextProps.data !== this.props.data ||
      nextProps.selectedTimeIndex !== this.props.selectedTimeIndex;
  }

  public render() {
    const { data, selectedTimeIndex } = this.props;
    const chartData: Data[] = [
      {
        label: 'Shortage',
        color: 'blue',
        series: data.map(d => ({ value: d.blueWaterShortage, date: toMidpoint(d.startYear, d.endYear) })),
      },
    ];
    const selectedData = data[selectedTimeIndex];

    if (some<{ value?: number; date: Date }>(chartData[0].series, d => d.value == null)) {
      console.warn('Missing water shortage data for selected region');
      return null;
    }

    return (
      <LineChart
        data={chartData}
        width={500}
        height={400}
        yAxisLabel="Availability per capita (m³)"
        annotationLine={toMidpoint(selectedData.startYear, selectedData.endYear)}
      />
    );
  }
}

export default ShortageLineChart;
