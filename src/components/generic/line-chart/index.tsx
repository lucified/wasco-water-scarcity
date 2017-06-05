import { bisectRight, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLinear, ScaleThreshold, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { curveLinear, line } from 'd3-shape';
import { transition } from 'd3-transition';
import * as React from 'react';

const styles = require('./index.scss');

export interface Datum {
  value: number;
  date: Date;
}

export interface Data {
  label?: string;
  color: string;
  series: Datum[];
}

interface PassedProps {
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
  annotationLineIndex?: number;
  onHover?: (hoveredIndex: number) => void;
  backgroundColorScale?: ScaleThreshold<number, string>;
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
  private numberFormatter = format('.3g');

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
      annotationLineIndex,
      backgroundColorScale,
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
      .curve(curveLinear)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    if (backgroundColorScale) {
      const backgroundColorsGroup = g.append('g')
        .attr('id', 'background-colors');
      const thresholds = backgroundColorScale.domain();
      const colorAreaLowerBounds = [
        dataValueExtent[0],
        ...thresholds.filter(d => d > dataValueExtent[0] && d <= dataValueExtent[1]),
      ];
      const colorAreas = colorAreaLowerBounds.map((lowerBound, i) => ({
        lowerBound,
        upperBound: colorAreaLowerBounds[i + 1] || dataValueExtent[1],
      }));
      backgroundColorsGroup.selectAll('rect')
        .data(colorAreas)
        .enter()
          .append('rect')
          .attr('class', styles['background-colors'])
          .attr('x', 0)
          .attr('y', d => yScale(d.upperBound))
          .attr('width', chartWidth)
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
    }

    g.select('g#x-axis').call(axisBottom(xScale));
    g.select('g#y-axis').call(axisLeft(yScale));

    if (annotationLineIndex != null) {
      const selectedData = seriesData[annotationLineIndex];
      const annotationGroup = g.append('g')
        .attr('id', 'annotation-group');

      annotationGroup.append('path')
        .datum(dataValueExtent.map(d => ({ date: selectedData.date, value: d })))
        .attr('d', lineGenerator)
        .attr('class', styles['annotation-line']);

      annotationGroup.append('text')
        .attr('class', styles['annotation-label'])
        .attr('x', 9)
        .attr('dy', '.35em')
        .attr('transform', `translate(${xScale(selectedData.date)},${yScale(selectedData.value)})`)
        .text(this.numberFormatter(selectedData.value));
    }

    const lineGroup = g.selectAll<SVGGElement, { label: string; color: string; series: Datum[]; }>('g#line-group')
      .data([data])
      .enter().append('g')
        .attr('id', 'line-group');

    lineGroup.append('path')
      .attr('class', styles.line)
      .attr('d', d => lineGenerator(d.series))
      .style('stroke', d => d.color);

    if (data.label) {
      lineGroup.append('text')
        .datum(d => ({ label: d.label, lastDatum: d.series[d.series.length - 1] }))
        .attr('transform', d => 'translate(' + xScale(d.lastDatum.date) + ',' + yScale(d.lastDatum.value) + ')')
        .attr('x', 3)
        .attr('dy', '0.35em')
        .attr('class', styles['line-label'])
        .text(d => d.label!);
    }

    // TODO: the hover handler needs to be removed and readded if the size or x-axis values are changed
    lineGroup.append('rect')
      .attr('class', styles.overlay)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .on('mousemove', this.handleMouseMove);
  }

  private findClosestIndex(date: Date) {
    const { data } = this.props as PropsWithDefaults;

    // TODO: make this more efficient
    const dataDates = data.series.map(d => d.date);
    // All earlier times are to the left of this index. It should never be 0.
    const indexOnRight = bisectRight(dataDates, date);

    if (indexOnRight < 1) {
      return 0;
    }

    if (indexOnRight >= data.series.length) {
      return data.series.length - 1;
    }

    const dateOnLeft = dataDates[indexOnRight - 1];
    const dateOnRight = dataDates[indexOnRight];
    if (date.getTime() - dateOnLeft.getTime() > dateOnRight.getTime() - date.getTime()) {
      return indexOnRight;
    }

    return indexOnRight - 1;
  }

  private handleMouseMove() {
    const { data, width, marginLeft, marginRight, onHover } = this.props as PropsWithDefaults;

    if (onHover) {
      // TODO: don't create scale on each handling
      const chartWidth = width - marginLeft - marginRight;
      const xScale = scaleTime<number, number>()
        .domain(extent(data.series, d => d.date) as [Date, Date])
        .range([0, chartWidth]);
      const lineGroup = select(this.svgRef!).select<SVGGElement>('g#line-group');
      const hoveredTime = xScale.invert(mouse(lineGroup.node() as any)[0]);
      onHover(this.findClosestIndex(hoveredTime));
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
      backgroundColorScale,
      annotationLineIndex,
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
      .curve(curveLinear)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    const t = transition('linechart').duration(100);

    if (backgroundColorScale) {
      const backgroundColorsGroup = g.select('g#background-colors');
      const thresholds = backgroundColorScale.domain();
      const colorAreaLowerBounds = [
        dataValueExtent[0],
        ...thresholds.filter(d => d > dataValueExtent[0] && d <= dataValueExtent[1]),
      ];
      const colorAreas = colorAreaLowerBounds.map((lowerBound, i) => ({
        lowerBound,
        upperBound: colorAreaLowerBounds[i + 1] || dataValueExtent[1],
      }));
      const colorRects = backgroundColorsGroup.selectAll('rect')
        .data(colorAreas);
      colorRects.enter()
          .append('rect')
          .attr('class', styles['background-colors'])
          .attr('x', 0)
          .attr('y', d => yScale(d.upperBound))
          .attr('width', chartWidth)
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
      colorRects
        .transition(t)
          .attr('y', d => yScale(d.upperBound))
          .attr('height', d => yScale(d.lowerBound) - yScale(d.upperBound))
          .attr('fill', d => backgroundColorScale(d.lowerBound));
      colorRects.exit().remove();
    }

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
        .text(d => d.label || '');

    // TODO: The following will break if annotationLine doesn't exist when the component is mounted
    if (annotationLineIndex != null) {
      const selectedData = seriesData[annotationLineIndex];
      const annotationGroup = g.select('g#annotation-group');
      annotationGroup.select('path')
        .datum(dataValueExtent.map(d => ({ date: selectedData.date, value: d })))
        .transition(t)
          .attr('d', lineGenerator);
      annotationGroup.select('text')
        .transition(t)
          .attr('transform', `translate(${xScale(selectedData.date)},${yScale(selectedData.value)})`)
          .text(this.numberFormatter(selectedData.value));
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
