import * as React from 'react';
import { createSelector } from 'reselect';
import { Datum } from '../../types';
import { formatAxisNumber, formatYearRange } from '../../utils';
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

export default class AvailabilityChart extends React.PureComponent<Props> {
  private generateBarChartData = createSelector(
    (props: Props) => props.data,
    data =>
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

  public render() {
    const {
      data,
      selectedTimeIndex,
      onTimeIndexChange,
      maxY,
      timeIndexLocked,
    } = this.props;
    const barChartData: BarChartDatum[] = this.generateBarChartData(this.props);

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
        yTickFormat={formatAxisNumber}
        xTickFormat={xTickFormatter}
        selectedIndex={selectedTimeIndex}
        indexLocked={timeIndexLocked}
        onMouseEnter={handleHover}
        onClick={this.handleClick}
        transitionDuration={100}
      />
    );
  }
}
