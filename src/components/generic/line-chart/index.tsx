import { bisectRight, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import {
  scaleLinear,
  ScaleLinear,
  ScaleThreshold,
  scaleTime,
  ScaleTime,
} from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { curveLinear, line, Line } from 'd3-shape';
import { transition } from 'd3-transition';
import { flatMap } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';

const XAxis = styled.g`
  path {
    display: none;
  }
`;

const YAxisLabel = styled.text`
  fill: black;
`;

const SVG = styled.svg`
  .line {
    fill: none;
    stroke-width: 1.5px;
  }

  .background-colors {
    opacity: 0.5;
  }

  .selected-area {
    fill: rgba(238, 238, 238, 0.5);
    stroke: darkgray;
  }

  .selected-label {
    font-family: sans-serif;
    font-size: 12px;
    color: black;
    text-shadow: -1px 1px 0 white, 1px 1px 0 white;
  }

  .overlay {
    fill: none;
    pointer-events: all;
  }
`;

export interface Datum {
  value: number | undefined;
  start: Date;
  end: Date;
}

export interface Data {
  id: string;
  color: string;
  series: Datum[];
}

interface PassedProps {
  data: Data | Data[];
  width: number;
  height: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  className?: string;
  maxY?: number;
  minY?: number;
  yAxisLabel?: string;
  selectedTimeIndex?: number;
  selectedTimeIndexLocked?: boolean;
  selectedDataSeries?: string;
  selectedDataSeriesLocked?: boolean;
  onChartHover?: (hoveredIndex: number) => void; // Hovering on top of the chart
  onLineHover?: (hoveredLineId: string) => void; // Hovered on line
  onClick?: () => void;
  backgroundColorScale?: ScaleThreshold<number, string>;
  yAxisFormatter?: (num: number, index?: number) => string;
  labelFormatter?: (num: number, index?: number) => string;
}

interface DefaultProps {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

type Props = PassedProps;
type PropsWithDefaults = Props & DefaultProps;

function toMidpoint(start: Date, end: Date): Date {
  return new Date((end.getTime() + start.getTime()) / 2);
}

class LineChart extends React.Component<Props> {
  public static defaultProps: DefaultProps = {
    marginTop: 20,
    marginRight: 80,
    marginBottom: 30,
    marginLeft: 50,
  };

  constructor(props: Props) {
    super(props);

    this.storeSvgRef = this.storeSvgRef.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  private svgRef?: SVGElement;
  private xScale?: ScaleTime<number, number>;
  private yScale?: ScaleLinear<number, number>;
  private lineGenerator?: Line<Datum>;

  public componentDidMount() {
    this.generateScales();
    this.drawChart();
  }

  public componentDidUpdate() {
    this.generateScales();
    this.redrawChart();
  }

  private generateScales() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      maxY,
      minY,
      width,
      height,
      data,
    } = this.props as PropsWithDefaults;
    const seriesData = Array.isArray(data)
      ? flatMap(data, d => d.series)
      : data.series;
    const dataValueExtent = extent(seriesData, d => d.value) as [
      number,
      number
    ];

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    this.xScale = scaleTime<number, number>()
      .domain(extent(flatMap(seriesData.map(d => [d.start, d.end]))) as [
        Date,
        Date
      ])
      .range([0, chartWidth]);
    this.yScale = scaleLinear()
      .domain([minY || dataValueExtent[0], maxY || dataValueExtent[1]])
      .range([chartHeight, 0]);
    this.lineGenerator = line<Datum>()
      .curve(curveLinear)
      .defined(d => d.value != null)
      .x(d => this.xScale!(toMidpoint(d.start, d.end)))
      .y(d => this.yScale!(d.value!));
  }

  // We need to have a selectedTimeIndex and if the this.props.data is an array,
  // also a selectedDataSeries
  private getSelectedDataPoint() {
    const { selectedTimeIndex, selectedDataSeries, data } = this.props;

    if (
      selectedTimeIndex == null ||
      (Array.isArray(data) && selectedDataSeries == null)
    ) {
      return undefined;
    }

    if (Array.isArray(data)) {
      const selectedData = data.find(d => d.id === selectedDataSeries);
      return selectedData && selectedData.series[selectedTimeIndex];
    }

    return data.series[selectedTimeIndex];
  }

  private drawChart() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      width,
      height,
      selectedTimeIndexLocked,
      selectedDataSeries,
      selectedDataSeriesLocked,
      backgroundColorScale,
      data,
      onLineHover,
      labelFormatter,
      yAxisFormatter,
    } = this.props as PropsWithDefaults;

    const seriesData = Array.isArray(data)
      ? flatMap(data, d => d.series)
      : data.series;
    const dataValueExtent = extent(seriesData, d => d.value) as [
      number,
      number
    ];
    const selectedDataPoint = this.getSelectedDataPoint();

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );
    const yScale = this.yScale!;
    const xScale = this.xScale!;

    if (backgroundColorScale) {
      const backgroundColorsGroup = g
        .append('g')
        .attr('id', 'background-colors');
      const thresholds = backgroundColorScale.domain();
      const colorAreaLowerBounds = [
        dataValueExtent[0],
        ...thresholds.filter(
          d => d > dataValueExtent[0] && d <= dataValueExtent[1],
        ),
      ];
      const colorAreas = colorAreaLowerBounds.map((lowerBound, i) => ({
        lowerBound,
        upperBound: colorAreaLowerBounds[i + 1] || dataValueExtent[1],
      }));
      // prettier-ignore
      backgroundColorsGroup
        .selectAll('rect')
        .data(colorAreas)
        .enter()
          .append('rect')
          .attr('class', 'background-colors')
          .attr('x', 0)
          .attr('y', d => yScale(d.upperBound))
          .attr('width', chartWidth)
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
    }

    g.select<SVGGElement>('g#x-axis').call(
      axisBottom(xScale).ticks(Math.round(chartWidth / 50)),
    );
    g.select<SVGGElement>('g#y-axis').call(
      axisLeft(yScale)
        .tickFormat(yAxisFormatter || (yScale.tickFormat() as any)) // TODO: fix typings
        .ticks(Math.round(chartHeight / 30)),
    );

    if (selectedDataPoint) {
      g.append('rect')
        .attr('id', 'selected-group')
        .attr('x', xScale(selectedDataPoint.start))
        .attr('y', 0)
        .attr('height', chartHeight)
        .attr(
          'width',
          xScale(selectedDataPoint.end) - xScale(selectedDataPoint.start),
        )
        .attr('stroke-width', selectedTimeIndexLocked ? 2 : 0)
        .attr('class', 'selected-area');
    }

    // TODO: the hover handler needs to be removed and readded if the size or x-axis values are changed
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .on('mousemove', this.handleMouseMove);

    // prettier-ignore
    const lineGroup = g
      .selectAll<SVGGElement, Data>('g.line-group')
      .data(Array.isArray(data) ? data : [data], d => d.id)
      .enter()
        .append('g')
        .attr('class', 'line-group');

    lineGroup
      .append('path')
      .attr('class', 'line')
      .attr('d', d => this.lineGenerator!(d.series))
      .style(
        'opacity',
        d => (selectedDataSeries && d.id !== selectedDataSeries ? 0.1 : 1),
      )
      .style(
        'stroke',
        d =>
          selectedDataSeriesLocked && d.id === selectedDataSeries
            ? '#e6007e'
            : d.color,
      )
      .on('mouseenter', d => {
        if (onLineHover) {
          onLineHover(d.id);
        }
      });

    if (selectedDataPoint) {
      g.append('text')
        .attr('id', 'selected-label')
        .attr('class', 'selected-label')
        .attr('x', 9)
        .attr('dy', '.35em')
        .attr(
          'transform',
          `translate(${xScale(
            toMidpoint(selectedDataPoint.start, selectedDataPoint.end),
          )},${yScale(selectedDataPoint.value!)})`,
        )
        .text((labelFormatter || format('.3s'))(selectedDataPoint.value!));
    }
  }

  private findClosestIndex(date: Date) {
    const { data } = this.props as PropsWithDefaults;

    // TODO: make this more efficient?
    // TODO: This assumes the time index is the same for all series shown
    const dataSeries = Array.isArray(data) ? data[0].series : data.series;
    const dataDates = dataSeries.map(d => toMidpoint(d.start, d.end));
    // All earlier times are to the left of this index. It should never be 0.
    const indexOnRight = bisectRight(dataDates, date);

    if (indexOnRight < 1) {
      return 0;
    }

    if (indexOnRight >= dataSeries.length) {
      return dataSeries.length - 1;
    }

    const dateOnLeft = dataDates[indexOnRight - 1];
    const dateOnRight = dataDates[indexOnRight];
    if (
      date.getTime() - dateOnLeft.getTime() >
      dateOnRight.getTime() - date.getTime()
    ) {
      return indexOnRight;
    }

    return indexOnRight - 1;
  }

  private handleMouseMove() {
    const { onChartHover } = this.props as PropsWithDefaults;

    if (onChartHover) {
      const lineGroup = select(this.svgRef!).select<SVGGElement>(
        'g.line-group',
      );
      const hoveredTime = this.xScale!.invert(
        mouse(lineGroup.node() as any)[0],
      );
      onChartHover(this.findClosestIndex(hoveredTime));
    }
  }

  private redrawChart() {
    const {
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
      width,
      height,
      backgroundColorScale,
      selectedDataSeries,
      selectedDataSeriesLocked,
      selectedTimeIndexLocked,
      data,
      onLineHover,
      yAxisFormatter,
      labelFormatter,
    } = this.props as PropsWithDefaults;

    const seriesData = Array.isArray(data)
      ? flatMap(data, d => d.series)
      : data.series;
    const dataValueExtent = extent(seriesData, d => d.value) as [
      number,
      number
    ];
    const selectedDataPoint = this.getSelectedDataPoint();

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );
    const xScale = this.xScale!;
    const yScale = this.yScale!;

    const t = transition('linechart').duration(100);

    if (backgroundColorScale) {
      const backgroundColorsGroup = g.select('g#background-colors');
      const thresholds = backgroundColorScale.domain();
      const colorAreaLowerBounds = [
        dataValueExtent[0],
        ...thresholds.filter(
          d => d > dataValueExtent[0] && d <= dataValueExtent[1],
        ),
      ];
      const colorAreas = colorAreaLowerBounds.map((lowerBound, i) => ({
        lowerBound,
        upperBound: colorAreaLowerBounds[i + 1] || dataValueExtent[1],
      }));
      const colorRects = backgroundColorsGroup
        .selectAll<SVGRectElement, any>('rect')
        .data(colorAreas);
      // prettier-ignore
      colorRects
        .enter()
          .append('rect')
          .attr('class', 'background-colors')
          .attr('x', 0)
          .attr('y', d => yScale(d.upperBound))
          .attr('width', chartWidth)
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
      // prettier-ignore
      colorRects
        .transition(t as any)
          .attr('y', d => yScale(d.upperBound))
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
      colorRects.exit().remove();
    }

    // prettier-ignore
    g
      .select('g#x-axis')
      .transition(t as any)
        .call(axisBottom(xScale).ticks(Math.round(chartWidth / 50)) as any);
    // prettier-ignore
    g
      .select('g#y-axis')
      .transition(t as any)
        .call(
          axisLeft(yScale)
            .tickFormat(yAxisFormatter || (yScale.tickFormat() as any)) // TODO: fix typings
            .ticks(Math.round(chartHeight / 30)) as any,
        );

    const lineGroup = g
      .selectAll<SVGGElement, Data>('g.line-group')
      .data(Array.isArray(data) ? data : [data], d => d.id);

    // prettier-ignore
    lineGroup.enter()
      .append('g')
        .attr('class', 'line-group')
        .append('path')
          .attr('class', 'line')
          .on('mouseenter', d => {
            if (onLineHover) {
              onLineHover(d.id);
            }
          });

    // prettier-ignore
    lineGroup
      .select('path')
      .transition(t as any)
        .style(
          'opacity',
          d => selectedDataSeries && d.id !== selectedDataSeries ? 0.1 : 1,
        )
        .style(
          'stroke',
          d => selectedDataSeriesLocked && d.id === selectedDataSeries
            ? '#e6007e'
            : d.color,
        )
        .attr('d', d => this.lineGenerator!(d.series));

    lineGroup.exit().remove();

    // TODO: The following will break if selectedTimeIndex doesn't exist when the component is mounted
    if (selectedDataPoint) {
      // prettier-ignore
      g
        .select('rect#selected-group')
        .transition(t as any)
          .attr('x', xScale(selectedDataPoint.start))
          .attr(
            'width',
            xScale(selectedDataPoint.end) - xScale(selectedDataPoint.start),
          )
          .attr('stroke-width', selectedTimeIndexLocked ? 2 : 0);

      // prettier-ignore
      g
        .select('text#selected-label')
        .transition(t as any)
          .attr(
            'transform',
            `translate(${xScale(
              toMidpoint(selectedDataPoint.start, selectedDataPoint.end),
            )},${yScale(selectedDataPoint.value!)})`,
          )
          .text((labelFormatter || format('.3s'))(selectedDataPoint.value!));
    }
  }

  private storeSvgRef(el: SVGSVGElement) {
    this.svgRef = el;
  }

  public render() {
    const {
      width,
      height,
      marginLeft,
      marginTop,
      marginBottom,
      yAxisLabel,
      className,
      onClick,
    } = this.props as PropsWithDefaults;

    return (
      <SVG
        width={width}
        height={height}
        className={className}
        innerRef={this.storeSvgRef}
        onClick={onClick}
      >
        <g id="main-group" transform={`translate(${marginLeft},${marginTop})`}>
          <XAxis
            id="x-axis"
            transform={`translate(0,${height - marginTop - marginBottom})`}
          />
          <g id="y-axis">
            {yAxisLabel && (
              <YAxisLabel transform="rotate(-90)" y="6" dy="0.71em">
                {yAxisLabel}
              </YAxisLabel>
            )}
          </g>
        </g>
      </SVG>
    );
  }
}

export default LineChart;
