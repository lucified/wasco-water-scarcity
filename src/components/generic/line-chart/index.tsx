import { extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { curveBasis, line } from 'd3-shape';
import { transition } from 'd3-transition';
import * as React from 'react';

const styles = require('./index.scss');

export interface Datum {
  value: number;
  date: Date;
}

export interface Data {
  label: string;
  color: string;
  series: Datum[];
}

interface PassedProps {
  // Each Data is a separate line
  data: Data;
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
  annotationLine?: Date;
  onHover?: (hoveredDate: Date) => void;
}

interface DefaultProps {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

type Props = PassedProps;
type PropsWithDefaults = Props & DefaultProps;

class LineChart extends React.Component<Props, void> {
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

  public componentDidMount() {
    this.drawChart();
  }

  public componentDidUpdate() {
    this.redrawChart();
  }

  private drawChart() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      maxY,
      minY,
      width,
      height,
      annotationLine,
      data,
    } = this.props as PropsWithDefaults;

    const seriesData = data.series;
    const dataValueExtent = extent(seriesData, d => d.value) as [number, number];

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>('g#main-group');

    const xScale = scaleTime<number, number>()
      .domain(extent(seriesData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);
    const yScale = scaleLinear()
      .domain([minY || dataValueExtent[0], maxY || dataValueExtent[1]])
      .range([chartHeight, 0]);

    const lineGenerator = line<Datum>()
      .curve(curveBasis)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    g.select('g#x-axis').call(axisBottom(xScale));
    g.select('g#y-axis').call(axisLeft(yScale));

    if (annotationLine) {
      g.append('g')
        .append('path')
          .datum(dataValueExtent.map(d => ({ date: annotationLine, value: d })))
          .attr('d', lineGenerator)
          .attr('class', styles['annotation-line']);
    }

    const lineGroup = g.selectAll<SVGGElement, { label: string; color: string; series: Datum[]; }>('g#line-group')
      .data([data])
      .enter().append('g')
        .attr('id', 'line-group');

    lineGroup.append('path')
      .attr('class', styles.line)
      .attr('d', d => lineGenerator(d.series))
      .style('stroke', d => d.color);

    lineGroup.append('text')
      .datum(d => ({ label: d.label, lastDatum: d.series[d.series.length - 1] }))
      .attr('transform', d => 'translate(' + xScale(d.lastDatum.date) + ',' + yScale(d.lastDatum.value) + ')')
      .attr('x', 3)
      .attr('dy', '0.35em')
      .attr('class', styles['line-label'])
      .text(d => d.label);

    // TODO: the hover handler needs to be removed and readded if the size or x-axis values are changed
    lineGroup.append('rect')
      .attr('class', styles.overlay)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .on('mousemove', this.handleMouseMove);
  }

  private handleMouseMove() {
    const { data, width, marginLeft, marginRight, onHover } = this.props as PropsWithDefaults;

    if (onHover) {
      // TODO: don't scale on each handling
      const chartWidth = width - marginLeft - marginRight;
      const xScale = scaleTime<number, number>()
        .domain(extent(data.series, d => d.date) as [Date, Date])
        .range([0, chartWidth]);
      const lineGroup = select(this.svgRef!).select<SVGGElement>('g#line-group');

      onHover(xScale.invert(mouse(lineGroup.node() as any)[0]));
    }
  }

  private redrawChart() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      maxY,
      minY,
      width,
      height,
      annotationLine,
      data,
    } = this.props as PropsWithDefaults;

    const seriesData = data.series;
    const dataValueExtent = extent(seriesData, d => d.value) as [number, number];

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>('g#main-group');

    const xScale = scaleTime<number, number>()
      .domain(extent(seriesData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);
    const yScale = scaleLinear()
      .domain([minY || dataValueExtent[0], maxY || dataValueExtent[1]])
      .range([chartHeight, 0]);

    const lineGenerator = line<Datum>()
      .curve(curveBasis)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    const t = transition('linechart').duration(100);

    g.select('g#x-axis').transition(t)
      .call(axisBottom(xScale) as any);
    g.select('g#y-axis').transition(t)
      .call(axisLeft(yScale) as any);

    const lineGroup = g.selectAll<SVGGElement, { label: string; color: string; series: Datum[]; }>('g#line-group')
      .data([data]);

    lineGroup.select('path')
      .transition(t)
        .attr('d', d => lineGenerator(d.series));

    lineGroup.select('text')
      .datum(d => ({ label: d.label, lastDatum: d.series[d.series.length - 1] }))
      .transition(t)
        .attr('transform', d => 'translate(' + xScale(d.lastDatum.date) + ',' + yScale(d.lastDatum.value) + ')')
        .text(d => d.label);

    // TODO: The following will break if annotationLine doesn't exist when the component is mounted
    if (annotationLine) {
      g.select(`path.${styles['annotation-line']}`)
        .datum(dataValueExtent.map(d => ({ date: annotationLine, value: d })))
        .transition(t)
          .attr('d', lineGenerator);
    }
  }

  private storeSvgRef(el: SVGElement) {
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
    } = this.props as PropsWithDefaults;

    return (
      <svg width={width} height={height} className={className} ref={this.storeSvgRef}>
        <g id="main-group" transform={`translate(${marginLeft},${marginTop})`}>
          <g id="x-axis" className={styles['x-axis']} transform={`translate(0,${height - marginTop - marginBottom})`} />
          <g id="y-axis">
            {yAxisLabel && (
              <text transform="rotate(-90)" y="6" dy="0.71em" className={styles['y-axis-label']}>
                {yAxisLabel}
              </text>
            )}
          </g>
        </g>
      </svg>
    );
  }
}

export default LineChart;
