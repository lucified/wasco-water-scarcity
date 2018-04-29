import { extent } from 'd3-array';
import { scaleLinear, ScaleLinear, scaleTime, ScaleTime } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';
import { flatMap } from 'lodash';
import * as React from 'react';

// From: https://stackoverflow.com/a/15666143
const PIXEL_RATIO = (() => {
  const ctx: any = document.createElement('canvas').getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const bsr =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;

  return dpr / bsr;
})();

export interface Point {
  time: Date;
  value: number;
}

export interface Series {
  id: string;
  color: string;
  points: Point[];
}

interface PassedProps {
  width: number;
  height: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  data: Series[];
}

interface DefaultProps {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

type Props = PassedProps;
type PropsWithDefaults = Props & DefaultProps;

export class CanvasLineChart extends React.PureComponent<Props> {
  private canvasRef!: HTMLCanvasElement;

  public static defaultProps: DefaultProps = {
    marginLeft: 40,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 40,
  };

  private chartWidth() {
    const { width, marginLeft, marginRight } = this.props as PropsWithDefaults;
    return width - marginLeft - marginRight;
  }

  private chartHeight() {
    const { height, marginTop, marginBottom } = this.props as PropsWithDefaults;
    return height - marginTop - marginBottom;
  }

  public componentDidMount() {
    this.drawChart();
  }

  public componentDidUpdate() {
    this.drawChart();
  }

  // Based on https://bl.ocks.org/mbostock/1550e57e12e73b86ad9e
  private drawChart() {
    const { data, marginLeft, marginTop, width, height } = this
      .props as PropsWithDefaults;

    if (data.length === 0) {
      return;
    }

    const chartWidth = this.chartWidth();
    const chartHeight = this.chartHeight();
    const context = this.canvasRef.getContext('2d')!;

    context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
    context.globalAlpha = 1.0;
    context.clearRect(0, 0, width, height);

    const x = scaleTime()
      .domain(extent(flatMap(data, d => d.points.map(p => p.time))) as [
        Date,
        Date
      ])
      .range([0, chartWidth]);
    const y = scaleLinear()
      .domain(extent(flatMap(data, d => d.points.map(p => p.value))) as [
        number,
        number
      ])
      .range([chartHeight, 0]);

    const lineGenerator = line<Point>()
      .x(d => x(d.time))
      .y(d => y(d.value))
      .curve(curveMonotoneX)
      .context(context);

    context.translate(marginLeft, marginTop);

    this.drawXAxis(context, x);
    this.drawYAxis(context, y);

    context.globalAlpha = 0.2;
    context.lineWidth = 0.2;
    context.strokeStyle = data[0].color;
    data.forEach(d => {
      context.beginPath();
      lineGenerator(d.points);
      if (context.strokeStyle !== d.color) {
        context.strokeStyle = d.color;
      }
      context.stroke();
    });
  }

  private drawXAxis(
    context: CanvasRenderingContext2D,
    x: ScaleTime<number, number>,
  ) {
    const chartHeight = this.chartHeight();
    const tickCount = 10;
    const tickSize = 6;
    const ticks = x.ticks(tickCount);
    const tickFormat = x.tickFormat();

    context.beginPath();
    ticks.forEach(d => {
      context.moveTo(x(d), chartHeight);
      context.lineTo(x(d), chartHeight + tickSize);
    });
    context.strokeStyle = 'black';
    context.stroke();

    context.textAlign = 'center';
    context.textBaseline = 'top';
    ticks.forEach(d => {
      context.fillText(tickFormat(d), x(d), chartHeight + tickSize);
    });
  }

  private drawYAxis(
    context: CanvasRenderingContext2D,
    y: ScaleLinear<number, number>,
  ) {
    const chartHeight = this.chartHeight();
    const tickCount = 10;
    const tickSize = 6;
    const tickPadding = 3;
    const ticks = y.ticks(tickCount);
    const tickFormat = y.tickFormat(tickCount);

    context.beginPath();
    ticks.forEach(d => {
      context.moveTo(0, y(d));
      context.lineTo(-6, y(d));
    });
    context.strokeStyle = 'black';
    context.stroke();

    context.beginPath();
    context.moveTo(-tickSize, 0);
    context.lineTo(0.5, 0);
    context.lineTo(0.5, chartHeight);
    context.lineTo(-tickSize, chartHeight);
    context.strokeStyle = 'black';
    context.stroke();

    context.textAlign = 'right';
    context.textBaseline = 'middle';
    ticks.forEach(d => {
      context.fillText(tickFormat(d), -tickSize - tickPadding, y(d));
    });

    // context.save();
    // context.rotate(-Math.PI / 2);
    // context.textAlign = 'right';
    // context.textBaseline = 'top';
    // context.font = 'bold 10px sans-serif';
    // context.fillText('Price (US$)', -10, 10);
    // context.restore();
  }

  public render() {
    const { width, height } = this.props;
    return (
      <canvas
        width={width * PIXEL_RATIO}
        height={height * PIXEL_RATIO}
        style={{ width, height }}
        ref={ref => (this.canvasRef = ref!)}
      />
    );
  }
}
