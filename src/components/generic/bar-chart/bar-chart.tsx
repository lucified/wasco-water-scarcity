import { max } from 'd3-array';
import { Axis, axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { scaleBand, ScaleBand, ScaleLinear, scaleLinear } from 'd3-scale';
import * as React from 'react';
import styled from 'styled-components';

import AxisComponent from '../axis';
import Bar from './bar';

import { BarChartDatum } from './types';

const SVGChart = styled.svg`
  overflow: visible;
`;

const Background = styled.rect`
  fill: transparent;
`;

const Axis = styled(AxisComponent)`
  font: 0.65rem sans-serif;
  overflow-y: hidden;

  /* render tick marks */
  line {
    display: none;
  }

  /* do not render axis */
  path {
    fill: none;
    stroke: lighten(#000, 80);
  }
`;

const SelectionBackground = styled.rect`
  fill: #eee;
  opacity: 0.8;
  ${({ locked }: { locked?: boolean }) =>
    locked
      ? `
    stroke: darkgray;
    stroke-width: 2px;
  `
      : ''}};
`;

const SelectionLabel = styled.text`
  font-family: sans-serif;
  font-size: 12px;
  color: black;
  text-shadow: -1px 1px 0 white, 1px 1px 0 white;
`;

const HoverArea = styled.rect`
  fill: none;
  pointer-events: all;
`;

export interface Props {
  data: BarChartDatum[];
  height?: number;
  width?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  xTickFormat?: (value: string) => string;
  yTickFormat?: (value: number) => string;
  onMouseEnter?: (item: BarChartDatum) => void;
  onMouseOut?: (item: BarChartDatum) => void;
  onClick?: (item: BarChartDatum) => void;
  maxYValue?: number;
  className?: string;
  xTickValues?: string[];
  selectedIndex?: number;
  indexLocked?: boolean;
  hideSelectedLabel?: boolean;
  transitionDuration?: number;
}

interface DefaultProps {
  height: number;
  width: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  marginTop: number;
  xTickFormat: (value: string) => string;
  yTickFormat: (value: number) => string;
}

type PropsWithDefaults = Props & DefaultProps;

interface HoverRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  data: BarChartDatum;
  onMouseEnter: (item: BarChartDatum) => void;
  onMouseOut: (item: BarChartDatum) => void;
}

class HoverRect extends React.PureComponent<HoverRectProps> {
  private handleMouseOut = () => {
    this.props.onMouseOut(this.props.data);
  };

  private handleMouseEnter = () => {
    this.props.onMouseEnter(this.props.data);
  };

  public render() {
    const { x, y, width, height } = this.props;

    return (
      <HoverArea
        x={x}
        y={y}
        onMouseEnter={this.handleMouseEnter}
        onMouseOut={this.handleMouseOut}
        onTouchStart={this.handleMouseEnter}
        width={width}
        height={height}
      />
    );
  }
}

// tslint:disable:max-classes-per-file
export default class BarChart extends React.Component<Props, {}> {
  public static defaultProps: DefaultProps = {
    height: 160,
    width: 1000,
    marginLeft: 30,
    marginRight: 0,
    marginBottom: 0,
    marginTop: 0,
    xTickFormat: (value: string) => format('n')(parseInt(value, 0)),
    yTickFormat: (value: number) => String(value),
  };

  private _yScale?: ScaleLinear<number, number> | null;
  private _xScale?: ScaleBand<string> | null;
  private _yAxis?: Axis<number> | null;
  private _xAxis?: Axis<string> | null;
  private _enrichedData?: BarChartDatum[] | null;
  private _mouseOutTimer?: any;

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.data !== this.props.data) {
      this._enrichedData = null;
      this._yScale = null;
      this._xScale = null;
      this._yAxis = null;
      this._xAxis = null;
    }

    if (nextProps.width !== this.props.width) {
      this._xAxis = null;
      this._xScale = null;
    }

    if (nextProps.yTickFormat !== this.props.yTickFormat) {
      this._yAxis = null;
    }
  }

  public componentWillUnmount() {
    if (this._mouseOutTimer) {
      clearTimeout(this._mouseOutTimer);
    }
  }

  private getXAxis() {
    const { xTickValues } = this.props as PropsWithDefaults;
    if (!this._xAxis) {
      const xscale = this.getXScale();
      this._xAxis = axisBottom<string>(xscale)
        .tickSize(3)
        .tickFormat(this.props.xTickFormat!);
      if (xTickValues) {
        this._xAxis.tickValues(xTickValues);
      }
    }
    return this._xAxis!;
  }

  private getYAxis() {
    if (!this._yAxis) {
      this._yAxis = axisLeft<number>(this.getYScale())
        .tickFormat(this.props.yTickFormat!)
        .ticks(3)
        .tickSizeInner(4)
        .tickSizeOuter(0);
    }
    return this._yAxis!;
  }

  private getXScale() {
    if (!this._xScale) {
      const data = this.getEnrichedData();
      this._xScale = scaleBand()
        .domain(data.map(datum => String(datum.key)))
        .rangeRound([0, this.getContentWidth()])
        .paddingInner(0.2)
        .paddingOuter(0.2);
    }
    return this._xScale!;
  }

  private getYScale() {
    const { maxYValue } = this.props as PropsWithDefaults;
    if (!this._yScale) {
      this._yScale = scaleLinear()
        .domain([
          0,
          maxYValue ||
            1.1 *
              max(this.getEnrichedData(), datum => (datum ? datum.total : 0))!,
        ])
        .rangeRound([this.getContentHeight(), 0]);
    }
    return this._yScale!;
  }

  private getContentWidth() {
    const { marginLeft, marginRight, width } = this.props as PropsWithDefaults;
    const fullWidth = width - marginLeft - marginRight;
    return fullWidth;
  }

  private getContentHeight() {
    const { marginTop, marginBottom, height } = this.props as PropsWithDefaults;
    return height - marginTop - marginBottom;
  }

  // Get date enriched with positions calculated for the bars
  // and add them to the returned data structure
  private getEnrichedData() {
    const { data } = this.props as PropsWithDefaults;
    if (!this._enrichedData) {
      this._enrichedData = data.slice();
      this._enrichedData.forEach(barGroup => {
        let y0 = 0;
        // store the heights of the bars
        barGroup.values.forEach(bar => {
          bar.y0 = y0;
          y0 += +bar.total;
          bar.y1 = y0;
        });
      });
    }
    return this._enrichedData;
  }

  private getBars() {
    const { transitionDuration } = this.props;
    const data = this.getEnrichedData();
    const xScale = this.getXScale();
    const yScale = this.getYScale();
    const barWidth = xScale.bandwidth();
    return data.map(barData => {
      const bars = barData.values
        .filter(d => d.total > 0)
        .map(barSegmentData => (
          <Bar
            key={`${barData.key}-${barSegmentData.key}`}
            width={barWidth}
            y0={barSegmentData.y0!}
            y1={barSegmentData.y1!}
            scale={yScale}
            fill={barSegmentData.color!}
            transitionDuration={transitionDuration}
          />
        ));
      return (
        <g
          key={barData.key}
          transform={`translate(${xScale(String(barData.key))},0)`}
        >
          {bars}
        </g>
      );
    });
  }

  private getSelectionBackground() {
    const { data, selectedIndex, indexLocked } = this.props;
    if (selectedIndex == null) {
      return null;
    }

    const selectedData = data[selectedIndex];
    const xScale = this.getXScale();

    return (
      <SelectionBackground
        locked={indexLocked}
        x={
          xScale(String(selectedData.key))! -
          xScale.paddingInner() * xScale.step() / 2
        }
        y={0}
        width={xScale.step()}
        height={this.getContentHeight()}
      />
    );
  }

  private getSelectionLabel() {
    const { data, selectedIndex, yTickFormat, hideSelectedLabel } = this
      .props as PropsWithDefaults;
    if (selectedIndex == null || hideSelectedLabel) {
      return null;
    }

    const selectedData = data[selectedIndex];
    const xScale = this.getXScale();
    const yScale = this.getYScale();

    return (
      <SelectionLabel
        textAnchor="middle"
        x={xScale(String(selectedData.key))! + xScale.bandwidth() / 2}
        y={yScale(selectedData.total)}
        dy="-.35em"
      >
        {yTickFormat(selectedData.total)}
      </SelectionLabel>
    );
  }

  private getHoverAreas() {
    const { data } = this.props;
    const xScale = this.getXScale();

    return data.map(d => (
      <HoverRect
        key={`hover-${d.key}`}
        x={xScale(String(d.key))!}
        y={0}
        width={xScale.step()}
        height={this.getContentHeight()}
        onMouseOut={this.handleMouseOut}
        onMouseEnter={this.handleMouseEnter}
        data={d}
      />
    ));
  }

  private handleMouseEnter = (item: BarChartDatum) => {
    const { onMouseEnter } = this.props;
    if (onMouseEnter) {
      onMouseEnter(item);
    }
  };

  private handleMouseOut = (item: BarChartDatum) => {
    const { onMouseOut } = this.props;
    if (onMouseOut) {
      this._mouseOutTimer = setTimeout(() => {
        onMouseOut(item);
      }, 100);
    }
  };

  private handleMouseClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const { marginLeft, data, onClick } = this.props as PropsWithDefaults;
    if (onClick) {
      const xScale = this.getXScale();
      const barWidth = xScale.step();
      const index = Math.floor((e.nativeEvent.offsetX - marginLeft) / barWidth);
      onClick(data[index]);
    }
  };

  public render() {
    const {
      className,
      marginLeft,
      marginTop,
      height,
      width,
      transitionDuration,
    } = this.props as PropsWithDefaults;
    const contentHeight = this.getContentHeight();
    const contentWidth = this.getContentWidth();
    return (
      <SVGChart
        className={className}
        height={height}
        width={width}
        onClick={this.handleMouseClick}
      >
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          <Background width={contentWidth} height={contentHeight} />
          {this.getSelectionBackground()}
          <Axis
            axis={this.getXAxis()}
            transform={`translate(0,${contentHeight})`}
            transitionDuration={transitionDuration}
          />
          <Axis
            axis={this.getYAxis()}
            transitionDuration={transitionDuration}
          />
          {this.getBars()}
          {this.getSelectionLabel()}
          {this.getHoverAreas()}
        </g>
      </SVGChart>
    );
  }
}
