import { extent } from 'd3-array';
import { format } from 'd3-format';
import { scaleLinear, ScaleLinear, scaleTime, ScaleTime } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';
import { flatMap, isEqual, sortedUniq } from 'lodash';
import * as React from 'react';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import { theme } from '../../theme';

require('pepjs'); // Pointer Events polyfill. Needed for e.g. Safari

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  cursor: ew-resize;
  touch-action: none; /* needed for Pointer Events */
  overflow: visible;
`;

const SelectedLine = styled.line`
  stroke: ${theme.colors.textSelection};
  stroke-dasharray: 5 5;
  stroke-width: 1px;

  transition: transform 250ms;
`;

const SelectedPoint = styled.circle`
  stroke: ${theme.colors.textSelection};
  stroke-width: 2px;
  fill: none;

  transition: transform 250ms;
`;

const SelectedPointLabelContainer = styled.g`
  transition: transform 250ms;
`;

const SelectedPointLabel = styled.text`
  fill: ${theme.colors.textSelection};
  font-family: ${theme.bodyFontFamily};
  font-size: 12px;
  user-select: none;
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
  selectedTimeIndex?: number;
  onSetSelectedTimeIndex?: (index: number) => void;
  yAxisLabel?: string;
  yAxisFormatter?: (d: number) => string;
  yAxisColor?: (d: number) => string;
  labelFormatter?: (d: number) => string;
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
  private svgRef!: SVGElement;
  private isDragging = false;
  private previousYDomain: number[] = [0, 0];

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

  // Based on https://codesandbox.io/s/q83r7nrwv6
  private onPointerDown = (event: React.PointerEvent) => {
    this.isDragging = true;
    this.moveSelectedPointTo(event);
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onPointerMove = (event: React.PointerEvent) => {
    if (!this.isDragging) {
      return;
    }

    this.moveSelectedPointTo(event);
  };

  private moveSelectedPointTo(event: React.PointerEvent) {
    const {
      onSetSelectedTimeIndex,
      selectedSerie,
      marginLeft,
      selectedTimeIndex,
    } = this.props;
    if (!selectedSerie || !onSetSelectedTimeIndex) {
      return;
    }
    const { left } = this.svgRef.getBoundingClientRect();
    let x = event.pageX - left - marginLeft!;
    const chartWidth = this.chartWidth();
    const { xPoints } = this.getScales(this.props);

    if (x < 0) {
      x = 0;
    } else if (x > chartWidth) {
      x = chartWidth;
    }
    const index = Math.min(
      scaleLinear()
        .domain([0, chartWidth])
        .rangeRound([0, xPoints.length - 1])(x),
      selectedSerie.points.length - 1,
    );

    if (index !== selectedTimeIndex) {
      onSetSelectedTimeIndex(index);
    }
  }

  private getScales = createSelector(
    (props: Props) => props.series,
    (props: Props) => props.hoveredSeries,
    (props: Props) => props.selectedSerie,
    (series, hoveredSeries, selectedSerie) => {
      const chartWidth = this.chartWidth();
      const chartHeight = this.chartHeight();

      const allData = series.concat(
        hoveredSeries || [],
        selectedSerie ? [selectedSerie] : [],
      );

      const xPoints = sortedUniq(
        flatMap(allData, d => d.points.map(p => p.time.getTime())).sort(),
      ).map(t => new Date(t));
      const x = scaleTime()
        .domain([xPoints[0], xPoints[xPoints.length - 1]])
        .range([0, chartWidth]);
      const y = scaleLinear()
        .domain(extent(flatMap(allData, d => d.points.map(p => p.value))) as [
          number,
          number
        ])
        .range([chartHeight, 0]);

      return { x, y, xPoints };
    },
  );

  // Based on https://bl.ocks.org/mbostock/1550e57e12e73b86ad9e
  private drawChart(
    forceRedrawSeries = true,
    forceRedrawHovered = true,
    forceRedrawSelected = true,
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

    const { x, y } = this.getScales(this.props);

    let redrawEverything = false;
    const currentYDomain = y.domain();
    if (!isEqual(currentYDomain, this.previousYDomain)) {
      redrawEverything = true;
      this.previousYDomain = currentYDomain;
    }

    const lineGenerator = line<Point>()
      .x(d => x(d.time))
      .y(d => y(d.value))
      .curve(curveMonotoneX);

    if (redrawEverything || forceRedrawSeries) {
      const context = this.seriesAndAxisCanvasRef.getContext('2d')!;
      lineGenerator.context(context);

      context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      context.globalAlpha = 1.0;
      context.clearRect(0, 0, width, height);
      context.translate(marginLeft, marginTop);

      this.drawXAxis(context, x);
      this.drawYAxis(context, y);

      context.globalAlpha = Math.min(
        1,
        Math.max(0.2, 1 - (series.length - 100) / 2000),
      );
      context.lineWidth = series.length > 50 ? 0.2 : 0.5;
      series.forEach(d => {
        context.beginPath();
        lineGenerator(d.points);
        if (context.strokeStyle !== d.color) {
          context.strokeStyle = d.color;
        }
        context.stroke();
      });
    }

    if (redrawEverything || forceRedrawHovered) {
      const context = this.hoverCanvasRef.getContext('2d')!;
      lineGenerator.context(context);

      context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(marginLeft, marginTop);

      if (hoveredSeries) {
        context.globalAlpha = 0.7;
        context.lineWidth = hoveredSeries.length > 50 ? 0.2 : 1;
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

    if (redrawEverything || forceRedrawSelected) {
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
      const xPosition = x(d);
      context.moveTo(xPosition, chartHeight);
      context.lineTo(xPosition, chartHeight + tickSize);
    });
    context.strokeStyle = 'black';
    context.stroke();

    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = 'black';
    ticks.forEach(d => {
      context.fillText(tickFormat(d), x(d), chartHeight + tickSize);
    });
  }

  private drawYAxis(
    context: CanvasRenderingContext2D,
    y: ScaleLinear<number, number>,
  ) {
    const { yAxisFormatter, yAxisColor, yAxisLabel } = this.props;
    const tickCount = 10;
    const tickSize = 6;
    const tickPadding = 3;
    const ticks = y.ticks(tickCount);
    const tickFormat = yAxisFormatter || y.tickFormat(tickCount, 's');

    context.beginPath();
    ticks.forEach(d => {
      const yPosition = y(d);
      context.moveTo(0, yPosition);
      context.lineTo(-6, yPosition);
    });
    context.strokeStyle = 'black';
    context.stroke();

    context.textAlign = 'right';
    context.textBaseline = 'middle';
    ticks.forEach(d => {
      if (yAxisColor) {
        context.fillStyle = yAxisColor(d);
      }
      context.fillText(tickFormat(d), -tickSize - tickPadding, y(d));
    });

    if (yAxisLabel) {
      context.save();
      context.rotate(-Math.PI / 2);
      context.textAlign = 'right';
      context.textBaseline = 'top';
      context.fillStyle = theme.colors.gray;
      context.font = theme.bodyFontFamily;
      context.fillText(yAxisLabel, 0, 5);
      context.restore();
    }
  }

  public render() {
    const { width, height, className, labelFormatter } = this.props;
    const hiDPIWidth = width * PIXEL_RATIO;
    const hiDIPHeight = height * PIXEL_RATIO;

    const { x, y } = this.getScales(this.props);
    const {
      marginLeft,
      marginTop,
      selectedTimeIndex,
      selectedSerie,
    } = this.props;
    const selectedPoint =
      selectedTimeIndex != null &&
      selectedSerie &&
      selectedSerie.points[selectedTimeIndex];
    const selectedPointX = selectedPoint && Math.round(x(selectedPoint.time));
    const selectedPointY = selectedPoint && Math.round(y(selectedPoint.value));
    const positionLabelLeft =
      selectedPoint && selectedTimeIndex! > selectedSerie!.points.length / 2;
    const chartHeight = this.chartHeight();

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
        {selectedPoint && (
          <SVG
            style={{ width, height, zIndex: 3 }}
            innerRef={ref => (this.svgRef = ref)}
            onPointerDown={this.onPointerDown}
            onPointerUp={this.onPointerUp}
            onPointerCancel={this.onPointerUp}
            onPointerMove={this.onPointerMove}
            {...{ touchAction: 'none' }}
          >
            <g
              style={{
                transform: `translate(${marginLeft}px, ${marginTop}px)`,
              }}
            >
              <SelectedLine
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                style={{ transform: `translate(${selectedPointX}px, 0)` }}
              />
              <SelectedPoint
                x={0}
                y={0}
                r={5}
                style={{
                  transform: `translate(${selectedPointX}px, ${selectedPointY}px)`,
                }}
              />
              {/* Safari doesn't support CSS transitions on <text> elements (!!).
                Need to wrap it in a <g>. */}
              <SelectedPointLabelContainer
                style={{
                  transform: `translate(${selectedPointX}px, ${selectedPointY}px)`,
                }}
              >
                <SelectedPointLabel
                  x={0}
                  y={0}
                  dy="-0.65em"
                  dx={positionLabelLeft ? -5 : 5}
                  textAnchor={positionLabelLeft ? 'end' : 'start'}
                >
                  {(labelFormatter || format(','))(selectedPoint.value)}
                </SelectedPointLabel>
              </SelectedPointLabelContainer>
            </g>
          </SVG>
        )}
      </div>
    );
  }
}
