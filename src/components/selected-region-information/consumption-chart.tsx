import { max } from 'd3-array';
import { format } from 'd3-format';
import { schemeBlues } from 'd3-scale-chromatic';
import { range } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import memoize from '../../memoize';
import { Datum } from '../../types';
import { formatYearRange } from '../../utils';
import BarChart, { BarChartDatum } from '../generic/bar-chart';
import Legend, { LegendItem } from '../generic/legend';
import { theme } from '../theme';

const LegendContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Instructions = styled.span`
  white-space: nowrap;
  font-family: ${theme.labelFontFamily};
  font-size: 12px;
  color: ${theme.colors.textMenu};
  position: relative;
  top: 4px;
`;

interface PassedProps {
  data: Datum[];
  selectedTimeIndex: number;
  timeIndexLocked?: boolean;
  onTimeIndexChange: (value: number) => void;
  onToggleLock?: () => void;
  maxY?: number;
}

type Props = PassedProps;

interface State {
  hoveredType?: keyof Datum;
}

const yTickFormatter = format('.2s');

const colorScale = schemeBlues[9];

const legendItems: Array<LegendItem & { field: keyof Datum }> = [
  {
    title: 'Domestic',
    field: 'consumptionDomestic',
    color: colorScale[8],
  },
  {
    title: 'Electric',
    field: 'consumptionElectric',
    color: colorScale[7],
  },
  {
    title: 'Irrigation',
    field: 'consumptionIrrigation',
    color: colorScale[5],
  },
  {
    title: 'Livestock',
    field: 'consumptionLivestock',
    color: colorScale[3],
  },
  {
    title: 'Manufacturing',
    field: 'consumptionManufacturing',
    color: colorScale[2],
  },
];

class ConsumptionChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  private generateBarChartData = memoize(
    (data: Datum[], hoveredType?: keyof Datum) =>
      data.map((d, i) => ({
        key: i,
        total: d.consumptionTotal,
        values: legendItems
          // Filter out fields with zero and if we're hovered, only the hovered type
          .filter(
            ({ field }) =>
              d[field] > 0 && hoveredType ? field === hoveredType : true,
          )
          .map(({ title, field, color }) => ({
            key: title,
            total: d[field],
            color,
          })),
      })),
  );

  private handleLegendHover = (title?: string) => {
    if (!title) {
      this.setState({ hoveredType: undefined });
    } else {
      const hoveredField = legendItems.find(d => d.title === title);
      if (hoveredField) {
        this.setState({ hoveredType: hoveredField.field });
      } else {
        console.warn('Unknown type!', title);
      }
    }
  };

  private handleBarHover = (item: BarChartDatum) => {
    this.props.onTimeIndexChange(item.key);
  };

  private handleClick = (item: BarChartDatum) => {
    const { onToggleLock, onTimeIndexChange } = this.props;
    if (onToggleLock) {
      onToggleLock();
    }
    onTimeIndexChange(item.key);
  };

  private xTickFormatter = (i: string) => {
    const { data } = this.props;
    const d = data[Number(i)];
    return formatYearRange(d);
  };

  private getXTickValues() {
    const { data } = this.props;

    if (data.length <= 10) {
      return undefined;
    }

    return range(0, data.length, Math.floor(data.length / 10)).map(String);
  }

  public render() {
    const { data, maxY, selectedTimeIndex, timeIndexLocked } = this.props;
    const { hoveredType } = this.state;
    const chartMaxValue = hoveredType ? max(data, d => d[hoveredType]) : maxY;

    return (
      <div>
        <BarChart
          data={this.generateBarChartData(data, hoveredType)}
          maxYValue={chartMaxValue}
          height={180}
          marginBottom={20}
          marginRight={0}
          marginTop={15}
          marginLeft={40}
          yTickFormat={yTickFormatter}
          xTickFormat={this.xTickFormatter}
          xTickValues={this.getXTickValues()}
          selectedIndex={selectedTimeIndex}
          onClick={this.handleClick}
          indexLocked={timeIndexLocked}
          onMouseEnter={this.handleBarHover}
          transitionDuration={100}
        />
        <LegendContainer>
          <Instructions>Hover to filter:</Instructions>
          <Legend items={legendItems} onHover={this.handleLegendHover} />
        </LegendContainer>
      </div>
    );
  }
}

export default ConsumptionChart;
