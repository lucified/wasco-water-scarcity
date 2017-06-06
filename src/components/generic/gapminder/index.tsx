import * as classNames from 'classnames';
import { bisectRight, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import {
  scaleLog,
  ScaleLogarithmic,
  ScalePower,
  scaleSqrt,
  scaleTime,
} from 'd3-scale';
import { mouse, select, Selection } from 'd3-selection';
import { transition, Transition } from 'd3-transition';
import flatMap = require('lodash/flatMap');
import values = require('lodash/values');
import * as React from 'react';

const styles = require('./index.scss');

export interface CircleData {
  id: string;
  color: string;
  data: {
    [dataType: string]: number[];
  };
}

export interface Data {
  timeRanges: Array<[Date, Date]>;
  regions: {
    [id: string]: CircleData;
  };
}

interface ChartDatum {
  id: string;
  color: string;
  x: number[];
  y: number[];
  size: number[];
}

export type DataSeriesSelector = (
  data: { [dataType: string]: number[] },
) => number[];

interface PassedProps {
  data: Data;
  width: number;
  height: number;
  xSelector: DataSeriesSelector;
  ySelector: DataSeriesSelector;
  sizeSelector: DataSeriesSelector;
  selectedTimeIndex: number;
  selectedData?: string;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  className?: string;
  onHover?: (hoveredIndex: number) => void;
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

function generateChartData(
  data: Data,
  xSelector: DataSeriesSelector,
  ySelector: DataSeriesSelector,
  sizeSelector: DataSeriesSelector,
): ChartDatum[] {
  return Object.keys(data.regions).map(id => {
    const { data: regionData, color } = data.regions[id];

    return {
      id,
      color,
      x: xSelector(regionData),
      y: ySelector(regionData),
      size: sizeSelector(regionData),
    };
  });
}

function findClosestIndex(date: Date, data: Data) {
  const dataDates = data.timeRanges.map(d => toMidpoint(d[0], d[1]));
  // All earlier times are to the left of this index. It should never be 0.
  const indexOnRight = bisectRight(dataDates, date);

  if (indexOnRight < 1) {
    return 0;
  }

  if (indexOnRight >= data.timeRanges.length) {
    return data.timeRanges.length - 1;
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

class Gapminder extends React.Component<Props, void> {
  public static defaultProps: DefaultProps = {
    marginTop: 20,
    marginRight: 80,
    marginBottom: 30,
    marginLeft: 50,
  };

  constructor(props: Props) {
    super(props);

    this.storeSvgRef = this.storeSvgRef.bind(this);
    this.enableInteraction = this.enableInteraction.bind(this);
    this.circleOrder = this.circleOrder.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.chartData = generateChartData(
      props.data,
      props.xSelector,
      props.ySelector,
      props.sizeSelector,
    );
  }

  private svgRef?: SVGElement;
  private xScale?: ScaleLogarithmic<number, number>;
  private yScale?: ScaleLogarithmic<number, number>;
  private sizeScale?: ScalePower<number, number>;
  private chartData: ChartDatum[];

  public componentDidMount() {
    this.generateScales();
    this.drawChart();
  }

  public componentDidUpdate() {
    this.generateScales();
    this.redrawChart();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.data !== nextProps.data) {
      this.chartData = generateChartData(
        nextProps.data,
        nextProps.xSelector,
        nextProps.ySelector,
        nextProps.sizeSelector,
      );
    }
  }

  private generateScales() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      width,
      height,
      xSelector,
      ySelector,
      sizeSelector,
      data,
    } = this.props as PropsWithDefaults;

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    const regionDataArray = values(data.regions);
    const yExtent = extent(
      flatMap<number[], number>(regionDataArray.map(d => ySelector(d.data))),
    ) as [number, number];
    const xExtent = extent(
      flatMap<number[], number>(regionDataArray.map(d => xSelector(d.data))),
    ) as [number, number];
    const sizeExtent = extent(
      flatMap<number[], number>(regionDataArray.map(d => sizeSelector(d.data))),
    ) as [number, number];

    this.xScale = scaleLog().domain(xExtent).range([chartWidth, 0]);
    this.yScale = scaleLog().domain(yExtent).range([chartHeight, 0]);
    this.sizeScale = scaleSqrt().domain(sizeExtent).range([0, 40]);
  }

  private drawChart() {
    const { width, height, selectedTimeIndex, data } = this
      .props as PropsWithDefaults;

    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );

    g.select('g#x-axis').call(axisBottom(this.xScale!));
    g.select('g#y-axis').call(axisLeft(this.yScale!));

    const label = g
      .select('text#year-label')
      .attr('y', height - 60)
      .attr('x', width - 50)
      .text(
        data.timeRanges[selectedTimeIndex].map(d => d.getFullYear()).join('-'),
      );

    // prettier-ignore
    g
      .select('g#dots')
      .selectAll<SVGGElement, ChartDatum>(`.${styles.dot}`)
      .data(this.chartData, d => d.id)
      .enter()
        .append<SVGCircleElement>('circle')
        .attr('class', styles.dot)
        .call(this.drawCircle)
        .sort(this.circleOrder);

    // Add an overlay for the year label.
    const box = (label.node() as any).getBBox();
    g
      .select<SVGRectElement>(`rect.${styles.overlay}`)
      .attr('x', box.x)
      .attr('y', box.y)
      .attr('width', box.width)
      .attr('height', box.height)
      .on('mouseover', this.enableInteraction);
  }

  private enableInteraction() {
    const { data, onHover } = this.props;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );
    const label = g.select<SVGTextElement>('text#year-label');
    const box = label.node()!.getBBox();
    const timeExtent = extent(flatMap<Date[], Date>(data.timeRanges)) as [
      Date,
      Date
    ];
    const yearScale = scaleTime()
      .domain(timeExtent)
      .range([box.x + 10, box.x + box.width - 10])
      .clamp(true);

    g
      .select<SVGRectElement>(`rect.${styles.overlay}`)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('mousemove', mousemove)
      .on('touchmove', mousemove);

    function mouseover() {
      label.classed(styles.active, true);
    }

    function mouseout() {
      label.classed(styles.active, false);
    }

    function mousemove(this: SVGRectElement) {
      if (onHover) {
        const hoveredTime = yearScale.invert(mouse(this)[0]);
        onHover(findClosestIndex(hoveredTime, data));
      }
    }
  }

  // Positions the dots based on data.
  private drawCircle(
    circle:
      | Selection<SVGCircleElement, ChartDatum, any, any>
      | Transition<SVGCircleElement, ChartDatum, any, any>,
  ) {
    const { selectedTimeIndex, selectedData } = this.props;
    const { xScale, yScale, sizeScale } = this;
    circle
      .attr('cx', d => xScale!(d.x[selectedTimeIndex]))
      .attr('cy', d => yScale!(d.y[selectedTimeIndex]))
      .attr('r', d => sizeScale!(d.size[selectedTimeIndex]))
      .attr('fill', d => (d.id === selectedData ? 'blue' : d.color));
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  private circleOrder(a: ChartDatum, b: ChartDatum) {
    const { selectedTimeIndex } = this.props;
    return b.size[selectedTimeIndex] - a.size[selectedTimeIndex];
  }

  private redrawChart() {
    const { data, selectedTimeIndex } = this.props;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );
    const t = transition('gapminder').duration(100);

    // prettier-ignore
    g
      .selectAll<SVGCircleElement, ChartDatum>(`circle.${styles.dot}`)
      .data(this.chartData, d => d.id)
      .sort(this.circleOrder)
      .transition(t)
        .call(this.drawCircle as any);
    g
      .select('text#year-label')
      .text(
        data.timeRanges[selectedTimeIndex].map(d => d.getFullYear()).join('-'),
      );
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
      className,
    } = this.props as PropsWithDefaults;

    return (
      <svg
        width={width}
        height={height}
        className={className}
        ref={this.storeSvgRef}
      >
        <g id="main-group" transform={`translate(${marginLeft},${marginTop})`}>
          <text
            id="year-label"
            className={styles['year-label']}
            textAnchor="end"
          />
          <g
            id="x-axis"
            className={classNames(styles.axis, styles.x)}
            transform={`translate(0,${height - marginTop - marginBottom})`}
          />
          <g id="y-axis" className={classNames(styles.axis, styles.y)} />
          <g id="dots" />
          <rect className={styles.overlay} />
        </g>
      </svg>
    );
  }
}

export default Gapminder;
