import { extent } from 'd3-array';
import { scaleLinear, ScaleLinear, scaleTime, ScaleTime } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';
import { flatMap } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;

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
  className?: string;
  width: number;
  height: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  /**
   * Draws different series onto different canvases and only redraws them if
   * the series objects change. Memoize them to improve performance.
   */
  series: Series[];
  selectedSerie?: Series;
  hoveredSeries?: Series[];
  yAxisLabel?: string;
  yAxisFormatter?: (d: number) => string;
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
  private seriesAndAxisCanvasRef!: HTMLCanvasElement;
  private hoverCanvasRef!: HTMLCanvasElement;
  private selectedCanvasRef!: HTMLCanvasElement;

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

  public componentDidUpdate(prevProps: Props) {
    const shouldRedrawSeries = prevProps.series !== this.props.series;
    const shouldRedrawHoveredSeries =
      prevProps.hoveredSeries !== this.props.hoveredSeries;
    const shouldRedrawSelectedSeries =
      prevProps.selectedSerie !== this.props.selectedSerie;

    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.drawChart();
    } else if (
      shouldRedrawSeries ||
      shouldRedrawHoveredSeries ||
      shouldRedrawSelectedSeries
    ) {
      this.drawChart(
        shouldRedrawSeries,
        shouldRedrawHoveredSeries,
        shouldRedrawSelectedSeries,
      );
    }
  }

  // Based on https://bl.ocks.org/mbostock/1550e57e12e73b86ad9e
  private drawChart(
    redrawSeries = true,
    redrawHovered = true,
    redrawSelected = true,
  ) {
    const {
      series,
      selectedSerie,
      hoveredSeries,
      marginLeft,
      marginTop,
      width,
      height,
    } = this.props as PropsWithDefaults;

    const chartWidth = this.chartWidth();
    const chartHeight = this.chartHeight();

    const x = scaleTime()
      .domain(extent(flatMap(series, d => d.points.map(p => p.time))) as [
        Date,
        Date
      ])
      .range([0, chartWidth]);
    const y = scaleLinear()
      .domain(extent(flatMap(series, d => d.points.map(p => p.value))) as [
        number,
        number
      ])
      .range([chartHeight, 0]);

    const lineGenerator = line<Point>()
      .x(d => x(d.time))
      .y(d => y(d.value))
      .curve(curveMonotoneX);

    if (redrawSeries) {
      const context = this.seriesAndAxisCanvasRef.getContext('2d')!;
      lineGenerator.context(context);

      context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      context.globalAlpha = 1.0;
      context.clearRect(0, 0, width, height);
      context.translate(marginLeft, marginTop);

      this.drawXAxis(context, x);
      this.drawYAxis(context, y);

      context.globalAlpha = 0.2;
      context.lineWidth = 0.2;
      series.forEach(d => {
        context.beginPath();
        lineGenerator(d.points);
        if (context.strokeStyle !== d.color) {
          context.strokeStyle = d.color;
        }
        context.stroke();
      });
    }

    if (redrawHovered) {
      const context = this.hoverCanvasRef.getContext('2d')!;
      lineGenerator.context(context);

      context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(marginLeft, marginTop);

      if (hoveredSeries) {
        context.globalAlpha = 0.5;
        context.lineWidth = hoveredSeries.length > 5 ? 0.2 : 1;
        hoveredSeries.forEach(d => {
          context.beginPath();
          lineGenerator(d.points);
          if (context.strokeStyle !== d.color) {
            context.strokeStyle = d.color;
          }
          context.stroke();
        });
      }
    }

    if (redrawSelected) {
      const context = this.selectedCanvasRef.getContext('2d')!;
      lineGenerator.context(context);

      context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(marginLeft, marginTop);

      if (selectedSerie) {
        context.globalAlpha = 1;
        context.lineWidth = 1;
        context.beginPath();
        lineGenerator(selectedSerie.points);
        if (context.strokeStyle !== selectedSerie.color) {
          context.strokeStyle = selectedSerie.color;
        }
        context.stroke();
      }
    }
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
    const tickCount = 10;
    const tickSize = 6;
    const tickPadding = 3;
    const ticks = y.ticks(tickCount);
    const tickFormat =
      this.props.yAxisFormatter || y.tickFormat(tickCount, 's');

    context.beginPath();
    ticks.forEach(d => {
      context.moveTo(0, y(d));
      context.lineTo(-6, y(d));
    });
    context.strokeStyle = 'black';
    context.stroke();

    context.textAlign = 'right';
    context.textBaseline = 'middle';
    ticks.forEach(d => {
      context.fillText(tickFormat(d), -tickSize - tickPadding, y(d));
    });

    if (this.props.yAxisLabel) {
      context.save();
      context.rotate(-Math.PI / 2);
      context.textAlign = 'right';
      context.textBaseline = 'top';
      context.fillStyle = theme.colors.gray;
      context.font = theme.bodyFontFamily;
      context.fillText(this.props.yAxisLabel, 0, 5);
      context.restore();
    }
  }

  public render() {
    const { width, height, className } = this.props;
    const hiDPIWidth = width * PIXEL_RATIO;
    const hiDIPHeight = height * PIXEL_RATIO;

    return (
      <div
        style={{ width, height, position: 'relative' }}
        className={className}
      >
        <Canvas
          width={hiDPIWidth}
          height={hiDIPHeight}
          style={{ width, height, zIndex: 0 }}
          innerRef={ref => (this.seriesAndAxisCanvasRef = ref!)}
        />
        <Canvas
          width={hiDPIWidth}
          height={hiDIPHeight}
          style={{ width, height, zIndex: 1 }}
          innerRef={ref => (this.hoverCanvasRef = ref!)}
        />
        <Canvas
          width={hiDPIWidth}
          height={hiDIPHeight}
          style={{ width, height, zIndex: 2 }}
          innerRef={ref => (this.selectedCanvasRef = ref!)}
        />
      </div>
    );
  }
}
