import { format } from 'd3-format';
import * as React from 'react';

import memoize from '../../memoize';
import { Datum } from '../../types';
import { formatPopulation } from '../../utils';

import BarChart, { BarChartDatum } from '../generic/bar-chart';

interface PassedProps {
  data: Datum[];
  selectedTimeIndex: number;
  timeIndexLocked?: boolean;
  onToggleLock?: () => void;
  onTimeIndexChange: (value: number) => void;
  maxY?: number;
}

type Props = PassedProps;

export default class PopulationChart extends React.PureComponent<Props> {
  private generateBarChartData = memoize((data: Datum[]) =>
    data.map((d, i) => ({
      key: i,
      total: d.population,
      values: [
        {
          key: 'Population',
          total: d.population,
          color: 'darkgray',
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
        yTickFormat={formatPopulation}
        xTickFormat={xTickFormatter}
        selectedIndex={selectedTimeIndex}
        indexLocked={timeIndexLocked}
        onClick={this.handleClick}
        onMouseEnter={handleHover}
        transitionDuration={100}
      />
    );
  }
}
