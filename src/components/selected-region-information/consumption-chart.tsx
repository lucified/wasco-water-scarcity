import { max } from 'd3-array';
import { format } from 'd3-format';
import { schemeBlues } from 'd3-scale-chromatic';
import * as React from 'react';

import BarChart, { BarChartDatum } from '../generic/bar-chart';
import Legend, { LegendItem } from '../generic/legend';

import { StressShortageDatum } from '../../types';

interface PassedProps {
  data: StressShortageDatum[];
  selectedTimeIndex: number;
  onTimeIndexChange: (value: number) => void;
  maxY?: number;
}

type Props = PassedProps;

interface State {
  hoveredType?: keyof StressShortageDatum;
}

const yTickFormatter = format('.2s');

const colorScale = schemeBlues[9];

const legendItems: Array<LegendItem & { field: keyof StressShortageDatum }> = [
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
  }

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

  public render() {
    const { data, maxY, selectedTimeIndex } = this.props;
    const { hoveredType } = this.state;
    const chartMaxValue = hoveredType ? max(data, d => d[hoveredType]) : maxY;

    const barChartData: BarChartDatum[] = data.map((d, i) => {
      return {
        key: i,
        total: d.blueWaterConsumptionCalculatedTotal,
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
      };
    });

    return (
      <div>
        <BarChart
          data={barChartData}
          maxYValue={chartMaxValue}
          height={120}
          marginBottom={20}
          marginRight={0}
          marginTop={5}
          marginLeft={40}
          yTickFormat={yTickFormatter}
          selectedIndex={selectedTimeIndex}
          onMouseOver={this.handleBarHover}
        />
        <Legend items={legendItems} onHover={this.handleLegendHover} />
      </div>
    );
  }
}

export default ConsumptionChart;
