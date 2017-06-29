import * as React from 'react';
const Dimensions = require('react-dimensions');

import BarChart, { Props as BarChartProps } from './bar-chart';

type Props = BarChartProps & { containerWidth: number };

class ResponsiveBarChart extends React.Component<Props> {
  public render() {
    return (
      <BarChart
        {...this.props}
        width={this.props.containerWidth || this.props.width}
      />
    );
  }
}

export default Dimensions()(ResponsiveBarChart) as typeof BarChart;

export * from './types';
