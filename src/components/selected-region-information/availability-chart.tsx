import { format } from 'd3-format';
import { range } from 'lodash';
import * as React from 'react';

import memoize from '../../memoize';
import { Datum } from '../../types';
import { formatYearRange } from '../../utils';

import BarChart, { BarChartDatum } from '../generic/bar-chart';

interface PassedProps {
  data: Datum[];
  selectedTimeIndex: number;
  timeIndexLocked?: boolean;
  onTimeIndexChange: (value: number) => void;
  onToggleLock?: () => void;
  maxY?: number;
}

type Props = PassedProps;

const yTickFormatter = format('.2s');

export default class AvailabilityChart extends React.PureComponent<Props> {
  private generateBarChartData = memoize((data: Datum[]) =>
    data.map((d, i) => ({
      key: i,
      total: d.availability,
      values: [
        {
          key: 'Availability',
          total: d.availability,
          color: '#60c13c',
        },
      ],
    })),
  );

  private handleClick = (item: BarChartDatum) => {
    const { onToggleLock, onTimeIndexChange } = this.props;
    if (onToggleLock) {
      onToggleLock();
    }
    onTimeIndexChange(item.key);
  };

  private getXTickValues() {
    const { data } = this.props;

    if (data.length <= 10) {
      return undefined;
    }

    return range(0, data.length, Math.floor(data.length / 10)).map(String);
  }

  public render() {
    const {
      data,
      selectedTimeIndex,
      onTimeIndexChange,
      maxY,
      timeIndexLocked,
    } = this.props;
    const barChartData: BarChartDatum[] = this.generateBarChartData(data);

    function handleHover(item: BarChartDatum) {
      onTimeIndexChange(item.key);
    }

    function xTickFormatter(i: string) {
      const d = data[Number(i)];
      return formatYearRange(d);
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
        xTickValues={this.getXTickValues()}
        selectedIndex={selectedTimeIndex}
        indexLocked={timeIndexLocked}
        onMouseEnter={handleHover}
        onClick={this.handleClick}
        transitionDuration={100}
      />
    );
  }
}
