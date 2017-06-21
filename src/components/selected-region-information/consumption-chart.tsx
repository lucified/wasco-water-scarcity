import { max } from 'd3-array';
import { format } from 'd3-format';
import { schemeBlues } from 'd3-scale-chromatic';
import * as React from 'react';

import BarChart, { BarChartDatum } from '../generic/bar-chart';
import Legend, { LegendItem } from '../generic/legend';

import memoize from '../../memoize';
import { Datum } from '../../types';

interface PassedProps {
  data: Datum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
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

class ConsumptionChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleLegendHover = this.handleLegendHover.bind(this);
    this.handleBarHover = this.handleBarHover.bind(this);
    this.xTickFormatter = this.xTickFormatter.bind(this);
  }

  private generateBarChartData = memoize(
    (data: Datum[], hoveredType?: keyof Datum) =>
      data.map((d, i) => ({
        key: i,
        total: d.blueWaterConsumptionTotal,
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

  private handleLegendHover(title?: string) {
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
  }

  private handleBarHover(item: BarChartDatum) {
    this.props.onTimeIndexChange(item.key);
  }

  private xTickFormatter(index: string) {
    const { data } = this.props;
    const formatter = format('02d');
    const i = Number(index);
    return `${formatter(data[i].startYear % 100)}-${formatter(
      data[i].endYear % 100,
    )}`;
  }

  public render() {
    const { data, maxY, selectedTimeIndex } = this.props;
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
          selectedIndex={selectedTimeIndex}
          onMouseEnter={this.handleBarHover}
          transitionDuration={100}
        />
        <Legend items={legendItems} onHover={this.handleLegendHover} />
      </div>
    );
  }
}

export default ConsumptionChart;
