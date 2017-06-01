import { extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { curveBasis, line } from 'd3-shape';
import flatten = require('lodash/flatten');
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
  data: Data[];
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
  }

  private svgRef?: SVGElement;

  public componentDidMount() {
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

    const allData = flatten(data.map(d => d.series));
    const dataValueExtent = extent(allData, d => d.value) as [number, number];

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>('g#maingroup');

    const xScale = scaleTime<number, number>()
      .domain(extent(allData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);
    const yScale = scaleLinear()
      .domain([minY || dataValueExtent[0], maxY || dataValueExtent[1]])
      .range([chartHeight, 0]);

    const lineGenerator = line<Datum>()
      .curve(curveBasis)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    g.select('g#xaxis').call(axisBottom(xScale));
    g.select('g#yaxis').call(axisLeft(yScale));

    const dataLine = g.selectAll<SVGGElement, { label: string; color: string; series: Datum[]; }>('.line-group')
      .data(data)
      .enter().append('g')
        .attr('class', styles['line-group']);

    dataLine.append('path')
      .attr('class', styles.line)
      .attr('d', d => lineGenerator(d.series))
      .style('stroke', d => d.color);

    dataLine.append('text')
      .datum(d => ({ label: d.label, lastDatum: d.series[d.series.length - 1] }))
      .attr('transform', d => 'translate(' + xScale(d.lastDatum.date) + ',' + yScale(d.lastDatum.value) + ')')
      .attr('x', 3)
      .attr('dy', '0.35em')
      .attr('class', styles['line-label'])
      .text(d => d.label);
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
        <g id="maingroup" transform={`translate(${marginLeft},${marginTop})`}>
          <g id="xaxis" className={styles['x-axis']} transform={`translate(0,${height - marginTop - marginBottom})`} />
          <g id="yaxis" className={styles['y-axis']}>
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
