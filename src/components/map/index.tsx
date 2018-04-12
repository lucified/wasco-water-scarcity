import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
import { ExtendedFeature, ExtendedFeatureCollection, geoPath } from 'd3-geo';
import {
  scaleLinear,
  ScaleLinear,
  scaleThreshold,
  ScaleThreshold,
} from 'd3-scale';
import { event, select, Selection } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity } from 'd3-zoom';
import * as GeoJSON from 'geojson';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import { feature } from 'topojson';
import { setSelectedRegion, toggleSelectedRegion } from '../../actions';
import {
  defaultDataTypeThresholdMaxValues,
  getDataTypeColors,
  WaterRegionGeoJSON,
  WaterRegionGeoJSONFeature,
} from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedHistoricalDataType,
  getSelectedWaterRegionId,
  getSelectedWorldRegion,
  getThresholdsForDataType,
} from '../../selectors';
import { HistoricalDataType, TimeAggregate, WorldRegion } from '../../types';
import { theme } from '../theme';

// TODO: import properly once types exist
const { geoNaturalEarth2 } = require('d3-geo-projection');

const worldData = require('world-atlas/world/110m.json');

interface RiverData {
  scalerank: string;
  featurecla: string;
  name: string;
  note?: string;
}

interface CountryBorder {
  featureid: number;
  countryName: string;
}

interface Basin {
  featureid: number;
  basinName: string;
}

interface PopulatedPlaces {
  name: string;
}

interface DrainageDirection {
  strahler: number;
  basin: number;
}

interface GridData {
  centre: [number, number];
  dom?: { [startYear: string]: number };
  man?: { [startYear: string]: number };
  live?: { [startYear: string]: number };
  elec?: { [startYear: string]: number };
  irri?: { [startYear: string]: number };
  pop?: { [startYear: string]: number };
}

interface GridQuintile {
  [key: string]: number[] | undefined;
  dom?: number[];
  man?: number[];
  live?: number[];
  elec?: number[];
  irri?: number[];
  pop?: number[];
}

interface LocalData {
  basins?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiPolygon, Basin>
  >;
  places?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.Point, PopulatedPlaces>
  >;
  countries?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiPolygon, CountryBorder>
  >;
  rivers?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiLineString, RiverData>
  >;
  ddm?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.Point, DrainageDirection>
  >;
  grid: GridData[];
  gridQuintiles: GridQuintile;
}

const Land = styled.path`
  fill: ${theme.colors.grayLighter};
`;

const SVG = styled.svg`
  & .water-region {
    stroke-width: 0.5px;
    stroke: #ccc;
    transition: opacity 0.2s ease-in;

    &.selected {
      stroke: black;
      transition: opacity 0.2s ease-out;
    }
    &.unselected {
      opacity: 0.5;
      transition: opacity 0.2s ease-out;
    }
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

const DDM = styled.g`
  stroke-width: 0.25px;
  stroke: #71bcd5;
  opacity: 0.8;
  fill: none;
`;

const Rivers = styled.g`
  stroke-width: 0.5px;
  stroke: blue;
  fill: none;
`;

const Basins = styled.g`
  stroke-width: 0.5px;
  stroke: purple;
  fill: none;
`;

interface PassedProps {
  width: number;
  selectedData: TimeAggregate<number>;
  waterRegions: WaterRegionGeoJSON;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegion?: WorldRegion;
  selectedDataType: HistoricalDataType;
  colorScale: ScaleThreshold<number, string>;
  thresholds: number[];
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  toggleSelectedRegion: (regionId: number) => void;
  clearSelectedRegion: () => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;

interface State {
  zoomInToRegion: boolean;
}

function getColorScale(dataType: HistoricalDataType, thresholds: number[]) {
  const emptyColor = '#D2E3E5';

  const colors =
    dataType === 'shortage'
      ? [emptyColor, ...getDataTypeColors(dataType)].reverse()
      : [emptyColor, ...getDataTypeColors(dataType)];

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

class Map extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      zoomInToRegion: false,
    };

    this.width = props.width;
    this.height = this.width / 1.9;

    this.saveSvgRef = this.saveSvgRef.bind(this);
    this.handleRegionClick = this.handleRegionClick.bind(this);
    this.drawLegendRectangle = this.drawLegendRectangle.bind(this);
    this.addLegendLabels = this.addLegendLabels.bind(this);
  }

  private svgRef?: SVGElement;
  private width: number;
  private height: number;
  private legendWidth = 200;
  private colorScale?: ScaleThreshold<number, string>;
  private legendXScale?: ScaleLinear<number, number>;
  private legendExtentPairs?: Array<[number, number]>;

  private saveSvgRef(ref: SVGSVGElement) {
    this.svgRef = ref;
  }

  public componentDidMount() {
    this.generateScales();
    this.drawMap();
    this.drawLegend();
    this.zoomToGlobalArea(false);
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      selectedData,
      selectedWaterRegionId,
      selectedDataType,
      shortageThresholds,
      stressThresholds,
      thresholds,
      selectedWorldRegion,
    } = this.props;
    const { zoomInToRegion } = this.state;

    if (
      prevProps.selectedData !== selectedData ||
      prevProps.selectedWaterRegionId !== selectedWaterRegionId ||
      (prevState.zoomInToRegion && !this.state.zoomInToRegion)
    ) {
      this.redrawFillsAndBorders();
    }

    if (
      prevProps.selectedDataType !== selectedDataType ||
      prevProps.thresholds !== thresholds ||
      (selectedDataType === 'scarcity' &&
        (prevProps.stressThresholds !== stressThresholds ||
          prevProps.shortageThresholds !== shortageThresholds))
    ) {
      this.generateScales();
      this.redrawFillsAndBorders();
      this.redrawLegend();
    }

    if (prevProps.selectedWorldRegion !== selectedWorldRegion) {
      this.zoomToGlobalArea();
    }

    // TODO this is a little ugly
    if (
      (!prevState.zoomInToRegion && zoomInToRegion) ||
      (zoomInToRegion &&
        prevProps.selectedWaterRegionId !== selectedWaterRegionId) ||
      (zoomInToRegion && prevProps.selectedData !== selectedData) ||
      (zoomInToRegion && prevProps.selectedDataType !== selectedDataType)
    ) {
      this.zoomToWaterRegion();
    } else if (prevState.zoomInToRegion && !zoomInToRegion) {
      this.zoomToWaterRegion();
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

  private drawMap() {
    const {
      clearSelectedRegion,
      selectedWaterRegionId,
      waterRegions: { features },
    } = this.props;

    // Based on https://gist.github.com/mbostock/4448587
    const projection = geoNaturalEarth2()
      .precision(0.1)
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7]);
    const path = geoPath().projection(projection);

    const svg = select<SVGElement, undefined>(this.svgRef!)
      .attr('width', this.width)
      .attr('height', this.height);
    svg
      .select<SVGPathElement>('#sphere')
      .datum({ type: 'Sphere' })
      .attr('d', path as any); // TODO: fix typing

    svg.select('use#globe-fill').on('click', clearSelectedRegion);

    // Countries land mass
    svg
      .select<SVGPathElement>('path#land')
      .datum(feature(worldData, worldData.objects.land))
      .attr('d', path as any);

    // Water regions
    // prettier-ignore
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => String(d.properties.featureId))
      .enter()
      .append<SVGPathElement>('path')
        .attr('class', 'water-region')
        .classed(
          'selected',
          d => selectedWaterRegionId === d.properties.featureId,
        )
        .classed(
          'unselected',
          d =>
            selectedWaterRegionId !== undefined &&
            selectedWaterRegionId !== d.properties.featureId,
        )
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId))
        .on('click', this.handleRegionClick);
  }

  private drawLegend() {
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
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

  private drawLegendRectangle(
    rect: Selection<SVGRectElement, [number, number], any, any>,
  ) {
    const { legendXScale, colorScale } = this;
    rect
      .attr('x', d => legendXScale!(d[0]))
      .attr('width', d => legendXScale!(d[1]) - legendXScale!(d[0]))
      .attr('fill', d => colorScale!(d[0]));
  }

  private addLegendLabels(g: Selection<SVGGElement, undefined, any, any>) {
    const { selectedDataType } = this.props;
    if (selectedDataType === 'scarcity') {
      // TODO: fix this ugly hack
      g
        .call(
          axisBottom(this.legendXScale!)
            .tickSize(10)
            .tickValues([0.25, 0.75, 1.5])
            .tickFormat(
              d =>
                d === 0.25
                  ? 'Stress'
                  : d === 0.75 ? 'Shortage' : 'Stress + Shortage',
            ),
        )
        .select('.domain')
        .remove();
      g
        .selectAll('.tick')
        .select('line')
        .remove();
    } else {
      g
        .call(
          axisBottom(this.legendXScale!)
            .tickSize(13)
            .tickValues(this.colorScale!.domain())
            .tickFormat(
              selectedDataType === 'stress'
                ? format('.2f')
                : (format('d') as any), // TODO: fix typing
            ),
        )
        .select('.domain')
        .remove();
    }
  }

  private redrawLegend() {
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
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
    const { selectedWorldRegion } = this.props;
    const svg = select<SVGElement, undefined>(this.svgRef!);

    // Based on https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    const projection = geoNaturalEarth2()
      .precision(0.1)
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7]);

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
      bounds = [[0, 0], [this.width, this.height]];
    }

    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(
      1,
      Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height)),
    );
    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

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

  private handleRegionClick(d: WaterRegionGeoJSONFeature) {
    if (
      !this.state.zoomInToRegion &&
      d.properties.featureId === this.props.selectedWaterRegionId
    ) {
      this.toggleZoomInToRegion();
    } else {
      this.props.toggleSelectedRegion(d.properties.featureId);
    }
  }

  private toggleZoomInToRegion() {
    this.setState(state => ({ zoomInToRegion: !state.zoomInToRegion }));
  }

  private getColorForWaterRegion(featureId: number): string {
    const { colorScale, selectedData: { data } } = this.props;
    const value = data[featureId];
    return value != null ? colorScale(value) : '#807775';
  }

  private redrawFillsAndBorders() {
    const { selectedWaterRegionId, waterRegions: { features } } = this.props;
    const t = transition('waterRegion').duration(100);
    select<SVGGElement, undefined>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => String(d.properties.featureId))
      .classed(
        'selected',
        d => selectedWaterRegionId === d.properties.featureId,
      )
      .classed(
        'unselected',
        d =>
          selectedWaterRegionId !== undefined &&
          selectedWaterRegionId !== d.properties.featureId,
      )
      .transition(t as any)
      .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId));
  }

  private zoomToWaterRegion() {
    const { selectedWaterRegionId, waterRegions: { features } } = this.props;
    const svg = select<SVGElement, undefined>(this.svgRef!);

    const selectedWaterRegion = features.find(
      r => r.properties.featureId === selectedWaterRegionId,
    );

    // TODO: projection should be specific to spatial unit
    // Based on https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    const projection = geoNaturalEarth2()
      .precision(0.1)
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7]);

    const path = geoPath().projection(projection);

    svg
      .select('g#ddm')
      .selectAll('path')
      .remove();
    svg
      .select('g#rivers')
      .selectAll('path')
      .remove();
    svg
      .select('g#country-borders')
      .selectAll('path')
      .remove();
    svg
      .select('g#country-labels')
      .selectAll('text')
      .remove();
    svg
      .select('g#basins')
      .selectAll('path')
      .remove();
    svg
      .select('g#basin-labels')
      .selectAll('text')
      .remove();
    svg
      .select('g#places')
      .selectAll('path')
      .remove();
    svg
      .select('g#places-labels')
      .selectAll('text')
      .remove();
    svg
      .select('g#griddata')
      .selectAll('path')
      .remove();

    if (this.state.zoomInToRegion && selectedWaterRegion != null) {
      // FIXME: fetch data
      const localData: LocalData = require('./3.json');

      if (localData.ddm != null) {
        svg
          .select('g#ddm')
          .selectAll('path')
          .data(localData.ddm.features)
          .enter()
          .append('path')
          .attr('d', path);
      }

      if (localData.rivers != null) {
        svg
          .select('g#rivers')
          .selectAll('path')
          .data(localData.rivers.features)
          .enter()
          .append('path')
          .attr('d', path);
      }

      if (localData.countries != null) {
        svg
          .select('g#country-borders')
          .selectAll('path')
          .data(localData.countries.features)
          .enter()
          .append('path')
          .attr('d', path);

        svg
          .select('g#country-labels')
          .selectAll('text')
          .data(localData.countries.features)
          .enter()
          .append('text')
          .attr('x', d => path.centroid(d)[0])
          .attr('y', d => path.centroid(d)[1])
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .text(d => d.properties.countryName);
      }

      if (localData.basins != null) {
        svg
          .select('g#basins')
          .selectAll('path')
          .data(localData.basins.features)
          .enter()
          .append('path')
          .attr('d', path);

        svg
          .select('g#basin-labels')
          .selectAll('text')
          .data(localData.basins.features)
          .enter()
          .append('text')
          .attr('x', d => path.centroid(d)[0])
          .attr('y', d => path.centroid(d)[1])
          .style('fill', 'purple')
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .text(d => d.properties.basinName);
      }

      if (localData.places != null) {
        svg
          .select('g#places')
          .selectAll('path')
          .data(localData.places.features)
          .enter()
          .append('path')
          .attr('d', path.pointRadius(5))
          .attr('fill', 'grey');

        svg
          .select('g#places-labels')
          .selectAll('text')
          .data(localData.places.features)
          .enter()
          .append('text')
          .attr('x', d => projection(d.geometry.coordinates)[0])
          .attr('y', d => projection(d.geometry.coordinates)[1])
          .attr('text-anchor', 'left')
          .attr('dx', 2)
          .attr('font-size', '10px')
          .text(d => d.properties.name);
      }

      // TODO: add selector for variable
      const selectedGridVariable:
        | 'pop'
        | 'elec'
        | 'dom'
        | 'man'
        | 'live'
        | 'irri' =
        'pop';
      const quintiles = localData.gridQuintiles[selectedGridVariable];
      if (quintiles != null) {
        // TODO: might be a more efficient way of doing this?
        const griddataPoly: any = {
          type: 'FeatureCollection',
          features: localData.grid.map((d: GridData) => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [d.centre[0] - 0.25, d.centre[1] - 0.25],
                  [d.centre[0] - 0.25, d.centre[1] + 0.25],
                  [d.centre[0] + 0.25, d.centre[1] + 0.25],
                  [d.centre[0] + 0.25, d.centre[1] - 0.25],
                  [d.centre[0] - 0.25, d.centre[1] - 0.25],
                ],
              ],
            },
            properties: {
              data:
                d[selectedGridVariable] &&
                d[selectedGridVariable]![this.props.selectedData.startYear],
            },
          })),
        };

        // TODO: may want different color scales for each variable
        const colorScale = scaleThreshold<number, string>()
          .domain(quintiles)
          .range([
            'none',
            '#edf8e9',
            '#bae4b3',
            '#74c476',
            '#31a354',
            '#006d2c',
          ]);

        svg
          .select<SVGGElement>('g#griddata')
          .selectAll<
            SVGPathElement,
            ExtendedFeature<GeoJSON.Polygon, { data: number }>
          >('path')
          .data<ExtendedFeature<GeoJSON.Polygon, { data: number }>>(
            griddataPoly.features,
          )
          .enter()
          .append<SVGPathElement>('path')
          .attr('d', path as any)
          .attr(
            'fill',
            (d: ExtendedFeature<GeoJSON.Polygon, { data: number }>) =>
              d.properties.data == null
                ? 'none'
                : colorScale(d.properties.data),
          );
      }

      // TODO: is this zoom still suitable if we change projection at the same time?
      const bounds = path.bounds(selectedWaterRegion as any);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      const scale = 0.9 / Math.max(dx / this.width, dy / this.height);
      const translate = [
        this.width / 2 - scale * x,
        this.height / 2 - scale * y,
      ];

      const ourZoom = zoom().on('zoom', zoomed);

      const t = transition('zoom').duration(750);
      svg
        .transition(t as any)
        .call(
          ourZoom.transform as any,
          zoomIdentity.translate(translate[0], translate[1]).scale(scale),
        );
    }

    function zoomed() {
      select<SVGGElement, undefined>('g#water-regions').attr(
        'transform',
        event.transform,
      );
      // TODO: There's probably a better way of clearing the water region fill
      svg
        .select<SVGGElement>('g#water-regions')
        .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
        .attr('fill', 'none')
        .attr('pointer-events', 'visible');
      select<SVGGElement, undefined>('g#countries').attr(
        'transform',
        event.transform,
      );
      select<SVGGElement, undefined>('g#selected-region').attr(
        'transform',
        event.transform,
      );
      select<SVGGElement, undefined>('g#ddm')
        .attr('transform', event.transform)
        .selectAll('path')
        .attr('stroke-width', `${1.5 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#rivers')
        .attr('transform', event.transform)
        .selectAll('path')
        .attr('stroke-width', `${1.5 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#country-borders')
        .attr('transform', event.transform)
        .selectAll('path')
        .attr('stroke-width', `${1 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#country-labels')
        .attr('transform', event.transform)
        .selectAll('text')
        .attr('font-size', `${12 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#basins')
        .attr('transform', event.transform)
        .selectAll('path')
        .attr('stroke-width', `${1 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#basin-labels')
        .attr('transform', event.transform)
        .selectAll('text')
        .attr('font-size', `${12 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#places')
        .attr('transform', event.transform)
        .selectAll('path')
        .attr('d', path.pointRadius(5 / event.transform.k) as any);
      select<SVGGElement, undefined>('g#places-labels')
        .attr('transform', event.transform)
        .selectAll('text')
        .attr('dx', 8 / event.transform.k)
        .attr('font-size', `${10 / event.transform.k}px`);
      select<SVGGElement, undefined>('g#griddata').attr(
        'transform',
        event.transform,
      );
    }
  }

  public render() {
    const { selectedDataType } = this.props;

    return (
      <SVG innerRef={this.saveSvgRef}>
        <defs>
          <clipPath id="clip">
            <use xlinkHref="#sphere" />
          </clipPath>
          <path id="sphere" />
        </defs>
        <use id="globe-fill" xlinkHref="#sphere" style={{ fill: 'white' }} />
        <g id="countries">
          <Land id="land" clipPath="url(#clip)" />
        </g>
        <g id="water-regions" clipPath="url(#clip)" />
        <SelectedRegion id="selected-region" clipPath="url(#clip)" />
        <CountryBorders id="country-borders" clipPath="url(#clip)" />
        <Basins id="basins" clipPath="url(#clip)" />
        <g id="basin-labels" clipPath="url(#clip)" />
        <g id="country-labels" clipPath="url(#clip)" />
        <DDM id="ddm" clipPath="url(#clip)" />
        <Rivers id="rivers" clipPath="url(#clip)" />
        <g id="places" clipPath="url(#clip)" />
        <g id="places-labels" clipPath="url(#clip)" />
        <Legend
          id="legend"
          transform={`translate(${this.width * 0.6}, ${this.height - 40})`}
        >
          <LegendCaption x="0" y="-6">
            {getLabel(selectedDataType)}
          </LegendCaption>
        </Legend>
      </SVG>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const selectedDataType = getSelectedHistoricalDataType(state);
  const thresholds = getThresholdsForDataType(state, selectedDataType);

  return {
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedDataType,
    selectedWorldRegion: getSelectedWorldRegion(state),
    thresholds,
    colorScale: getColorScale(selectedDataType, thresholds),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    toggleSelectedRegion: (regionId: number) => {
      dispatch(toggleSelectedRegion(regionId));
    },
    clearSelectedRegion: () => {
      dispatch(setSelectedRegion());
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(Map);
