import { format } from 'd3-format';
import * as React from 'react';

import memoize from '../../memoize';
import { Datum } from '../../types';

import BarChart, { BarChartDatum } from '../generic/bar-chart';

interface PassedProps {
  data: Datum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
  maxY?: number;
}

type Props = PassedProps;

const yTickFormatter = format('.2s');

export default class AvailabilityChart extends React.PureComponent<Props> {
  private generateBarChartData = memoize((data: Datum[]) =>
    data.map((d, i) => ({
      key: i,
      total: d.blueWaterAvailability,
      values: [
        {
          key: 'Availability',
          total: d.blueWaterAvailability,
          color: 'green',
        },
      ],
    })),
  );

  public render() {
    const { data, selectedTimeIndex, onTimeIndexChange, maxY } = this.props;
    const barChartData: BarChartDatum[] = this.generateBarChartData(data);

    function handleHover(item: BarChartDatum) {
      onTimeIndexChange(item.key);
    }

    function xTickFormatter(index: string) {
      const formatter = format('02d');
      const i = Number(index);
      return `${formatter(data[i].startYear % 100)}-${formatter(
        data[i].endYear % 100,
      )}`;
    }

    return (
      <BarChart
        data={barChartData}
        maxYValue={maxY}
        height={180}
        marginBottom={20}
        marginRight={0}
        marginTop={15}
        marginLeft={40}
        yTickFormat={yTickFormatter}
        xTickFormat={xTickFormatter}
        selectedIndex={selectedTimeIndex}
        onMouseEnter={handleHover}
        transitionDuration={100}
      />
    );
  }
}
