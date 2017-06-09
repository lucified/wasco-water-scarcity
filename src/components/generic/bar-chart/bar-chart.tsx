import * as classNames from 'classnames';
import { max } from 'd3-array';
import { Axis, axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
} from 'd3-scale';
import * as React from 'react';

import AxisComponent from '../axis';
import Bar from './bar';

import * as styles from './bar-chart.scss';
import { BarChartDatum } from './types';

export interface Props {
  data: BarChartDatum[];
  height?: number;
  width?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  customColors?: any[][];
  onChange?: (range: [number, number]) => void;
  xTickFormat?: (value: string) => string;
  yTickFormat?: (value: number) => string;
  onMouseOver?: (item: any) => void;
  onMouseLeave?: (item: any) => void;
  maxYValue?: number;
  className?: string;
  xTickValues?: (xscale: ScaleBand<string>) => string[];
  selectedIndex?: number;
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

  private _colors?: ScaleOrdinal<any, any> | null;
  private _yScale?: ScaleLinear<number, number> | null;
  private _xScale?: ScaleBand<string> | null;
  private _yAxis?: Axis<number> | null;
  private _xAxis?: Axis<string> | null;
  private _enrichedData?: BarChartDatum[] | null;

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.customColors !== this.props.customColors) {
      this._colors = null;
    }

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

  private getXAxis() {
    const { xTickValues } = this.props as PropsWithDefaults;
    if (!this._xAxis) {
      const xscale = this.getXScale();
      this._xAxis = axisBottom<string>(xscale)
        .tickSize(5)
        .tickFormat(this.props.xTickFormat!);
      if (xTickValues) {
        this._xAxis.tickValues(xTickValues(xscale));
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
    const data = this.getEnrichedData();
    const xScale = this.getXScale();
    const yScale = this.getYScale();
    const barWidth = xScale.bandwidth();
    return data.map(barData => {
      const bars = barData.values.map(barSegmentData =>
        <Bar
          key={`${barData.key}-${barSegmentData.key}`}
          width={barWidth}
          y0={barSegmentData.y0!}
          y1={barSegmentData.y1!}
          scale={yScale}
          fill={barSegmentData.color!}
        />,
      );
      return (
        <g
          key={barData.key}
          className={styles['bar-group']}
          transform={`translate(${xScale(String(barData.key))},0)`}
          onMouseOver={this.handleMouseOver.bind(this, barData)}
          onMouseLeave={this.handleMouseLeave.bind(this, barData)}
        >
          {bars}
        </g>
      );
    });
  }

  private getSelectionBackground() {
    const { data, selectedIndex } = this.props;
    if (selectedIndex == null) {
      return null;
    }

    const selectedData = data[selectedIndex];
    const xScale = this.getXScale();

    return (
      <rect
        className={styles['selection-background']}
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
    const { data, selectedIndex, yTickFormat } = this
      .props as PropsWithDefaults;
    if (selectedIndex == null) {
      return null;
    }

    const selectedData = data[selectedIndex];
    const xScale = this.getXScale();
    const yScale = this.getYScale();

    return (
      <text
        className={styles['selection-label']}
        textAnchor="middle"
        x={xScale(String(selectedData.key))! + xScale.bandwidth() / 2}
        y={yScale(selectedData.total)}
        dy="-.35em"
      >
        {yTickFormat(selectedData.total)}
      </text>
    );
  }

  private handleMouseOver(item: any) {
    const { onMouseOver } = this.props;
    if (onMouseOver) {
      onMouseOver(item);
    }
  }

  private handleMouseLeave(item: any) {
    const { onMouseLeave } = this.props;
    if (onMouseLeave) {
      setTimeout(() => {
        if (onMouseLeave) {
          onMouseLeave(item);
        }
      }, 100);
    }
  }

  public render() {
    const { className, marginLeft, marginTop, height, width } = this
      .props as PropsWithDefaults;
    const contentHeight = this.getContentHeight();
    const contentWidth = this.getContentWidth();
    return (
      <svg
        className={classNames(styles.chart, className)}
        height={height}
        width={width}
      >
        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          <rect
            className={styles.background}
            width={contentWidth}
            height={contentHeight}
          />
          {this.getSelectionBackground()}
          <AxisComponent
            axis={this.getXAxis()}
            className={`x ${styles.axis}`}
            transform={`translate(0,${contentHeight})`}
          />
          <AxisComponent
            axis={this.getYAxis()}
            className={`y ${styles.axis}`}
          />
          {this.getBars()}
          {this.getSelectionLabel()}
        </g>
      </svg>
    );
  }
}
