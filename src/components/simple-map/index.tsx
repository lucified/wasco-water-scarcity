import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import {
  scaleLinear,
  ScaleLinear,
  scaleThreshold,
  ScaleThreshold,
} from 'd3-scale';
import { event, select, Selection } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity } from 'd3-zoom';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { feature } from 'topojson';
import {
  belowThresholdColor,
  defaultDataTypeThresholdMaxValues,
  getDataTypeColors,
  missingDataColor,
  WaterRegionGeoJSON,
  WaterRegionGeoJSONFeature,
} from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedWorldRegion,
  getThresholdsForDataType,
} from '../../selectors';
import { HistoricalDataType, TimeAggregate, WorldRegion } from '../../types';
import { theme } from '../theme';

const worldData = require('world-atlas/world/110m.json');

const Land = styled.path`
  fill: #d2e2e6;
`;

const SVG = styled.svg`
  /* Needed for IE11 */
  overflow: hidden;

  & .water-region {
    stroke-width: 0.5px;
    stroke: #ecf4f8;
    transition: opacity 300ms ease-in;
  }
`;

const SelectedRegion = styled.g`
  & path {
    stroke: ${theme.colors.grayDark};
    stroke-width: 0.5px;
    opacity: 0.8;
    fill: none;
  }
`;

const Legend = styled.g`
  user-select: none;
`;

const LegendCaption = styled.text`
  fill: #000;
  text-anchor: start;
  font-weight: bold;
`;

const CountryBorders = styled.g`
  stroke-width: 1px;
  stroke: black;
  fill: none;
`;

interface PassedProps {
  width: number;
  selectedData: TimeAggregate<number | undefined>;
  waterRegions: WaterRegionGeoJSON;
  selectedDataType: HistoricalDataType;
}

interface GeneratedStateProps {
  selectedWorldRegion?: WorldRegion;
  colorScale: ScaleThreshold<number, string>;
  thresholds: number[];
  stressThresholds: number[];
  shortageThresholds: number[];
}

type Props = GeneratedStateProps & PassedProps;

function getColorScale(dataType: HistoricalDataType, thresholds: number[]) {
  const colors =
    dataType === 'shortage'
      ? [belowThresholdColor, ...getDataTypeColors(dataType)].reverse()
      : [belowThresholdColor, ...getDataTypeColors(dataType)];

  return scaleThreshold<number, string>()
    .domain(thresholds)
    .range(colors);
}

function getLabel(dataType: HistoricalDataType) {
  switch (dataType) {
    case 'stress':
      return 'Water stress';
    case 'shortage':
      return 'Water shortage';
    case 'scarcity':
      return 'Water scarcity';
  }
}

class SimpleMap extends React.Component<Props> {
  private svgRef!: SVGElement;
  private legendWidth = 200;
  private colorScale?: ScaleThreshold<number, string>;
  private legendXScale?: ScaleLinear<number, number>;
  private legendExtentPairs?: Array<[number, number]>;

  public componentDidMount() {
    this.generateScales();
    this.drawMap();
    this.drawLegend();
    this.zoomToGlobalArea(false);
  }

  public componentDidUpdate(prevProps: Props) {
    const {
      selectedData,
      selectedDataType,
      shortageThresholds,
      stressThresholds,
      thresholds,
      selectedWorldRegion,
      width,
    } = this.props;
    if (prevProps.width !== width) {
      this.generateScales();
      this.clearMapAndLegend();
      this.drawMap();
      this.drawLegend();
    } else if (
      prevProps.selectedDataType !== selectedDataType ||
      prevProps.thresholds !== thresholds ||
      (selectedDataType === 'scarcity' &&
        (prevProps.stressThresholds !== stressThresholds ||
          prevProps.shortageThresholds !== shortageThresholds))
    ) {
      this.generateScales();
      this.redrawFillsAndBorders();
      this.redrawLegend();
    } else if (prevProps.selectedData !== selectedData) {
      this.redrawFillsAndBorders();
    }

    if (
      prevProps.selectedWorldRegion !== selectedWorldRegion ||
      width !== prevProps.width
    ) {
      this.zoomToGlobalArea();
    }
  }

  private generateScales() {
    const { colorScale, thresholds, selectedDataType } = this.props;
    // Based on https://bl.ocks.org/mbostock/4060606
    const maxThreshold = thresholds[thresholds.length - 1];
    const xScale = scaleLinear()
      .domain([
        0,
        Math.max(
          maxThreshold * 1.1,
          defaultDataTypeThresholdMaxValues[selectedDataType],
        ),
      ])
      .rangeRound([0, this.legendWidth]);

    this.legendExtentPairs = colorScale.range().map(d => {
      const colorExtent = colorScale.invertExtent(d);
      if (colorExtent[0] == null) {
        colorExtent[0] = xScale.domain()[0];
      }
      if (colorExtent[1] == null) {
        colorExtent[1] = xScale.domain()[1];
      }

      return colorExtent as [number, number];
    });
    this.colorScale = colorScale;
    this.legendXScale = xScale;
  }

  private getHeight() {
    return this.props.width / 1.9;
  }

  private clearMapAndLegend() {
    const svg = select<SVGElement, undefined>(this.svgRef);
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .remove();
    svg
      .select<SVGGElement>('g#legend')
      .selectAll<SVGRectElement, Array<[number, number]>>('rect')
      .remove();
  }

  private drawMap() {
    const {
      waterRegions: { features },
      width,
    } = this.props;
    const height = this.getHeight();

    // Based on https://gist.github.com/mbostock/4448587
    const projection = geoNaturalEarth1()
      .precision(0.1)
      .scale(width / 4.6)
      .translate([width / 2.2, height / 1.7]);
    const path = geoPath().projection(projection);

    const svg = select<SVGElement, undefined>(this.svgRef);
    svg
      .select<SVGPathElement>('#sphere')
      .datum({ type: 'Sphere' })
      .attr('d', path as any)
      .attr('fill', 'none');

    // Countries land mass
    svg
      .select<SVGPathElement>('path#land')
      .datum(feature(worldData, worldData.objects.land))
      .attr('d', path);

    // Water regions
    // prettier-ignore
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => d.properties.featureId.toString())
      .enter()
      .append<SVGPathElement>('path')
        .attr('class', 'water-region')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId));
  }

  private drawLegend() {
    const g = select<SVGElement, undefined>(this.svgRef).select<SVGGElement>(
      'g#legend',
    );

    // prettier-ignore
    g
      .selectAll<SVGRectElement, Array<[number, number]>>('rect')
      .data(this.legendExtentPairs!)
      .enter()
        .append<SVGRectElement>('rect')
        .attr('height', 8)
        .call(this.drawLegendRectangle);

    g.call(this.addLegendLabels);
  }

  private drawLegendRectangle = (
    rect: Selection<SVGRectElement, [number, number], any, any>,
  ) => {
    const { legendXScale, colorScale } = this;
    rect
      .attr('x', d => legendXScale!(d[0]))
      .attr('width', d => legendXScale!(d[1]) - legendXScale!(d[0]))
      .attr('fill', d => colorScale!(d[0]));
  };

  private addLegendLabels = (
    g: Selection<SVGGElement, undefined, any, any>,
  ) => {
    const { selectedDataType } = this.props;
    if (selectedDataType === 'scarcity') {
      // TODO: fix this ugly hack
      g.call(
        axisBottom(this.legendXScale!)
          .tickSize(10)
          .tickValues([0.12, 0.75, 1.32])
          .tickFormat(
            d =>
              d === 0.12
                ? 'Stress'
                : d === 0.75
                  ? 'Stress + Shortage'
                  : 'Shortage',
          ),
      )
        .select('.domain')
        .remove();
      g.selectAll('.tick')
        .select('line')
        .remove();
    } else {
      g.call(
        axisBottom(this.legendXScale!)
          .tickSize(13)
          .tickValues(this.colorScale!.domain())
          .tickFormat(
            selectedDataType === 'stress' ? format('.2f') : format('d'),
          ),
      )
        .select('.domain')
        .remove();
    }
  };

  private redrawLegend() {
    const g = select<SVGElement, undefined>(this.svgRef).select<SVGGElement>(
      'g#legend',
    );

    // prettier-ignore
    g
      .selectAll<SVGRectElement, Array<[number, number]>>('rect')
      .data(this.legendExtentPairs!)
      .call(this.drawLegendRectangle);

    g.call(this.addLegendLabels);
  }

  private zoomToGlobalArea(useTransition = true) {
    const { selectedWorldRegion, width } = this.props;
    const height = this.getHeight();
    const svg = select<SVGElement, undefined>(this.svgRef);

    // Based on https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    const projection = geoNaturalEarth1()
      .precision(0.1)
      .scale(width / 4.6)
      .translate([width / 2.2, height / 1.7]);

    let bounds;
    svg
      .select<SVGGElement>('g#selected-region')
      .select<SVGPathElement>('path')
      .remove();
    if (selectedWorldRegion) {
      const path = geoPath().projection(projection);
      bounds = path.bounds(selectedWorldRegion.feature);
      svg
        .select<SVGGElement>('g#selected-region')
        .append<SVGPathElement>('path')
        .datum(selectedWorldRegion.feature)
        .attr('d', path);
    } else {
      bounds = [[0, 0], [width, height]];
    }

    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(
      1,
      Math.min(8, 0.9 / Math.max(dx / width, dy / height)),
    );
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    const ourZoom = zoom().on('zoom', zoomed);

    const t = transition('zoom').duration(useTransition ? 750 : 0);
    svg
      .transition(t as any)
      .call(
        ourZoom.transform as any,
        zoomIdentity.translate(translate[0], translate[1]).scale(scale),
      );

    function zoomed() {
      select<SVGGElement, undefined>('g#water-regions').attr(
        'transform',
        event.transform,
      );
      select<SVGGElement, undefined>('g#countries').attr(
        'transform',
        event.transform,
      );
      select<SVGGElement, undefined>('g#selected-region').attr(
        'transform',
        event.transform,
      );
    }
  }

  private getColorForWaterRegion(featureId: number): string {
    const {
      colorScale,
      selectedData: { data },
    } = this.props;
    const value = data[featureId];
    return value != null ? colorScale(value) : missingDataColor;
  }

  private redrawFillsAndBorders() {
    const {
      waterRegions: { features },
    } = this.props;
    const t = transition('waterRegion').duration(300);
    select<SVGGElement, undefined>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => d.properties.featureId.toString())
      .transition(t as any)
      .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId));
  }

  public render() {
    const { selectedDataType, width } = this.props;
    const height = this.getHeight();

    return (
      <SVG
        width={width}
        height={height}
        innerRef={ref => {
          this.svgRef = ref;
        }}
      >
        <defs>
          <clipPath id="clip">
            <use xlinkHref="#sphere" />
          </clipPath>
          <path id="sphere" />
        </defs>
        <use
          id="globe-fill"
          xlinkHref="#sphere"
          style={{ fill: 'transparent' }}
        />
        <g id="countries">
          <Land id="land" clipPath="url(#clip)" />
        </g>
        <g id="water-regions" clipPath="url(#clip)" />
        <g id="grid-data" clipPath="url(#clip)" />
        <SelectedRegion id="selected-region" clipPath="url(#clip)" />
        <CountryBorders id="country-borders" clipPath="url(#clip)" />
        <Legend
          id="legend"
          transform={`translate(${Math.round(width * 0.6)}, ${Math.round(
            height - 26,
          )})`}
        >
          <LegendCaption x="0" y="-6">
            {getLabel(selectedDataType)}
          </LegendCaption>
        </Legend>
      </SVG>
    );
  }
}

export default connect<GeneratedStateProps, {}, PassedProps, StateTree>(
  (state, passedProps) => {
    const { selectedDataType } = passedProps;
    const thresholds = getThresholdsForDataType(state, selectedDataType);

    return {
      selectedWorldRegion: getSelectedWorldRegion(state),
      thresholds,
      colorScale: getColorScale(selectedDataType, thresholds),
      stressThresholds: getThresholdsForDataType(state, 'stress'),
      shortageThresholds: getThresholdsForDataType(state, 'shortage'),
    };
  },
)(SimpleMap);
