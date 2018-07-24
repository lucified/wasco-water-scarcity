import { ExtendedFeature, geoNaturalEarth1, geoPath, GeoSphere } from 'd3-geo';
import { scaleThreshold, ScaleThreshold } from 'd3-scale';
import { event, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity } from 'd3-zoom';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { feature } from 'topojson';
import {
  setRegionZoom,
  setSelectedRegion,
  toggleSelectedRegion,
} from '../../actions';
import {
  belowThresholdColor,
  getDataTypeColors,
  getLocalRegionData,
  GridData,
  GridVariable,
  LocalData,
  missingDataColor,
  WaterRegionGeoJSON,
  WaterRegionGeoJSONFeature,
} from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedWaterRegionId,
  getSelectedWorldRegion,
  getThresholdsForDataType,
  isZoomedInToRegion,
} from '../../selectors';
import { AnyDataType, TimeAggregate, WorldRegion } from '../../types';
import { theme } from '../theme';
import ThresholdSelector from '../threshold-selector';

const worldData = require('world-atlas/world/110m.json');

const Container = styled.div`
  position: relative;
`;

const StyledThresholdSelector = styled(ThresholdSelector)`
  position: absolute;
`;

const Land = styled.path`
  fill: #d2e2e6;
`;

const SVG = styled.svg`
  & .water-region {
    stroke-width: 0.5px;
    stroke: #ecf4f8;
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

  & .clickable-water-region {
    fill: none;
    stroke: none;
    pointer-events: all;
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

const scarcityColors = getDataTypeColors('scarcity');

const ScarcityLegend = styled.g`
  user-select: none;
`;

const LegendCaption = styled.text`
  fill: #000;
  font-size: 14px;
  text-anchor: start;
  font-weight: bold;
`;

const LegendLabel = styled.text`
  fill: #000;
  font-size: 12px;
  text-anchor: middle;
`;

interface PassedProps {
  width: number;
  selectedData: TimeAggregate<number>;
  waterRegions: WaterRegionGeoJSON;
  selectedDataType: AnyDataType;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegion?: WorldRegion;
  colorScale: ScaleThreshold<number, string>;
  thresholds: number[];
  stressThresholds: number[];
  shortageThresholds: number[];
  zoomInToRegion: boolean;
}

interface GeneratedDispatchProps {
  toggleSelectedRegion: (regionId: number) => void;
  clearSelectedRegion: () => void;
  setZoomInToRegion: (zoomedIn: boolean) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;

interface State {
  regionData: {
    [id: string]: LocalData;
  };
}

function getColorScale(dataType: AnyDataType, thresholds: number[]) {
  const colors =
    // These data types have a larger = better scale
    dataType === 'shortage' || dataType === 'kcal'
      ? [belowThresholdColor, ...getDataTypeColors(dataType)].reverse()
      : [belowThresholdColor, ...getDataTypeColors(dataType)];

  return scaleThreshold<number, string>()
    .domain(thresholds)
    .range(colors);
}

class Map extends React.Component<Props, State> {
  public state: State = {
    regionData: {},
  };

  private svgRef!: SVGElement;

  public componentDidMount() {
    this.drawMap();
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
      width,
      zoomInToRegion,
    } = this.props;

    if (prevProps.width !== width) {
      this.clearMap();
      this.drawMap();
    } else if (
      prevProps.selectedDataType !== selectedDataType ||
      prevProps.thresholds !== thresholds ||
      (selectedDataType === 'scarcity' &&
        (prevProps.stressThresholds !== stressThresholds ||
          prevProps.shortageThresholds !== shortageThresholds)) ||
      prevProps.selectedData !== selectedData ||
      prevProps.selectedWaterRegionId !== selectedWaterRegionId ||
      (prevProps.zoomInToRegion && !zoomInToRegion)
    ) {
      this.redrawFillsAndBorders();
    }

    if (
      prevProps.selectedWorldRegion !== selectedWorldRegion ||
      (!zoomInToRegion && width !== prevProps.width)
    ) {
      this.zoomToGlobalArea();
    }

    // TODO: this is a little ugly
    if (
      zoomInToRegion &&
      (!prevProps.zoomInToRegion ||
        prevProps.selectedWaterRegionId !== selectedWaterRegionId ||
        prevProps.selectedData !== selectedData ||
        prevProps.width !== width ||
        prevProps.selectedDataType !== selectedDataType ||
        (this.state.regionData[selectedWaterRegionId!] &&
          !prevState.regionData[selectedWaterRegionId!]))
    ) {
      this.removeZoomedInElements();
      this.zoomToWaterRegion();
    } else if (prevProps.zoomInToRegion && !zoomInToRegion) {
      this.removeZoomedInElements();
      this.zoomToGlobalArea();
    }
  }

  private getHeight() {
    return this.props.width / 1.9;
  }

  private clearMap() {
    const svg = select<SVGElement, undefined>(this.svgRef);
    svg.select('use#globe-fill').on('click', null);
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .remove();
    svg
      .select<SVGGElement>('g#clickable-water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .remove();
  }

  private drawMap() {
    const {
      clearSelectedRegion,
      selectedWaterRegionId,
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
      .datum<GeoSphere>({ type: 'Sphere' })
      .attr('d', path);

    svg.select('use#globe-fill').on('click', clearSelectedRegion);

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
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId));
    svg
      .select<SVGGElement>('g#clickable-water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => d.properties.featureId.toString())
      .enter()
      .append<SVGPathElement>('path')
      .attr('class', 'clickable-water-region')
      .attr('d', path)
      .on('click', this.handleRegionClick);
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
      select<SVGGElement, undefined>('g#clickable-water-regions').attr(
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

  private handleRegionClick = (d: WaterRegionGeoJSONFeature) => {
    if (d.properties.featureId === this.props.selectedWaterRegionId) {
      this.toggleZoomInToRegion();
    } else {
      this.props.toggleSelectedRegion(d.properties.featureId);
    }
  };

  private toggleZoomInToRegion = () => {
    this.props.setZoomInToRegion(!this.props.zoomInToRegion);
  };

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
      selectedWaterRegionId,
      waterRegions: { features },
    } = this.props;
    const t = transition('waterRegion').duration(100);
    select<SVGGElement, undefined>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => d.properties.featureId.toString())
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

  private async fetchRegionData(regionId: number) {
    const data = await getLocalRegionData(regionId);
    if (data) {
      this.setState(state => ({
        regionData: {
          ...state.regionData,
          [regionId]: data,
        },
      }));
    }
  }

  private removeZoomedInElements() {
    const svg = select<SVGElement, undefined>(this.svgRef);

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
      .select('g#grid-data')
      .selectAll('path')
      .remove();
  }

  private zoomToWaterRegion() {
    const {
      selectedWaterRegionId,
      width,
      waterRegions: { features },
      selectedData: { startYear },
      zoomInToRegion,
    } = this.props;

    const selectedWaterRegion =
      selectedWaterRegionId != null
        ? features.find(r => r.properties.featureId === selectedWaterRegionId)
        : undefined;

    if (
      !zoomInToRegion ||
      selectedWaterRegionId == null ||
      selectedWaterRegion == null
    ) {
      return;
    }

    const localData: LocalData | undefined = this.state.regionData[
      selectedWaterRegionId
    ];
    if (!localData) {
      this.fetchRegionData(selectedWaterRegionId);
      return;
    }

    const height = this.getHeight();
    const svg = select<SVGElement, undefined>(this.svgRef);

    // TODO?: projection should be specific to spatial unit
    // Based on https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    const projection = geoNaturalEarth1()
      .precision(0.1)
      .scale(width / 4.6)
      .translate([width / 2.2, height / 1.7]);

    const path = geoPath().projection(projection);

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
        .attr(
          'x',
          d => projection(d.geometry.coordinates as [number, number])![0],
        )
        .attr(
          'y',
          d => projection(d.geometry.coordinates as [number, number])![1],
        )
        .attr('text-anchor', 'left')
        .attr('dx', 2)
        .attr('font-size', '10px')
        .text(d => d.properties.name);
    }

    // TODO: add selector for variable
    const selectedGridVariable: GridVariable = 'pop';
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
              d[selectedGridVariable] && d[selectedGridVariable]![startYear],
          },
        })),
      };

      // TODO: may want different color scales for each variable
      const colorScale = scaleThreshold<number, string>()
        .domain(quintiles)
        .range(['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c']);

      svg
        .select<SVGGElement>('g#grid-data')
        .selectAll<
          SVGPathElement,
          ExtendedFeature<GeoJSON.Polygon, { data: number }>
        >('path')
        .data<ExtendedFeature<GeoJSON.Polygon, { data: number }>>(
          griddataPoly.features,
        )
        .enter()
        .append<SVGPathElement>('path')
        .attr('d', path)
        .attr(
          'fill',
          d =>
            d.properties.data == null ? 'none' : colorScale(d.properties.data),
        );
    }

    const bounds = path.bounds(selectedWaterRegion);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    const scale = 0.9 / Math.max(dx / width, dy / height);
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    const ourZoom = zoom().on('zoom', zoomed);

    const t = transition('zoom').duration(750);
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
      // TODO: There's probably a better way of clearing the water region fill
      svg
        .select<SVGGElement>('g#water-regions')
        .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
        .attr('fill', 'none')
        .attr('pointer-events', 'visible');
      select<SVGGElement, undefined>('g#clickable-water-regions').attr(
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
      select<SVGGElement, undefined>('g#grid-data').attr(
        'transform',
        event.transform,
      );
    }
  }

  private getScarcityLegend() {
    const { width } = this.props;
    const height = this.getHeight();

    return (
      <ScarcityLegend
        transform={`translate(${Math.round(width * 0.5)}, ${Math.round(
          height - 26,
        )})`}
      >
        <LegendCaption x="0" y="-6">
          Water scarcity
        </LegendCaption>
        <rect
          x="0"
          y="0"
          width="50"
          height="10"
          fill={scarcityColors[0]}
          strokeWidth="0"
        />
        <LegendLabel x="25" y="22" dx="2">
          Stress
        </LegendLabel>
        <rect
          x="50"
          y="0"
          width="115"
          height="10"
          fill={scarcityColors[1]}
          strokeWidth="0"
        />
        <LegendLabel x="108" y="22" dx="2">
          Stress + Shortage
        </LegendLabel>
        <rect
          x="165"
          y="0"
          width="65"
          height="10"
          fill={scarcityColors[2]}
          strokeWidth="0"
        />
        <LegendLabel x="197" y="22" dx="2">
          Shortage
        </LegendLabel>
      </ScarcityLegend>
    );
  }

  public render() {
    const { selectedDataType, width } = this.props;
    const height = this.getHeight();

    return (
      <Container>
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
          <use id="globe-fill" xlinkHref="#sphere" style={{ fill: 'white' }} />
          <g id="countries">
            <Land id="land" clipPath="url(#clip)" />
          </g>
          <g id="water-regions" clipPath="url(#clip)" />
          <g id="grid-data" clipPath="url(#clip)" />
          <SelectedRegion id="selected-region" clipPath="url(#clip)" />
          <CountryBorders id="country-borders" clipPath="url(#clip)" />
          <Basins id="basins" clipPath="url(#clip)" />
          <g id="basin-labels" clipPath="url(#clip)" />
          <g id="country-labels" clipPath="url(#clip)" />
          <DDM id="ddm" clipPath="url(#clip)" />
          <Rivers id="rivers" clipPath="url(#clip)" />
          <g id="places" clipPath="url(#clip)" />
          <g id="places-labels" clipPath="url(#clip)" />
          <g id="clickable-water-regions" clipPath="url(#clip)" />
          {selectedDataType === 'scarcity' && this.getScarcityLegend()}
        </SVG>
        {selectedDataType !== 'scarcity' && (
          <StyledThresholdSelector
            style={{ left: width * 0.5, top: height - 40 }}
            dataType={selectedDataType}
          />
        )}
      </Container>
    );
  }
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(
  (state, { selectedDataType }) => {
    const thresholds = getThresholdsForDataType(state, selectedDataType);

    return {
      selectedWaterRegionId: getSelectedWaterRegionId(state),
      selectedWorldRegion: getSelectedWorldRegion(state),
      thresholds,
      colorScale: getColorScale(selectedDataType, thresholds),
      stressThresholds: getThresholdsForDataType(state, 'stress'),
      shortageThresholds: getThresholdsForDataType(state, 'shortage'),
      zoomInToRegion: isZoomedInToRegion(state),
    };
  },
  dispatch => ({
    toggleSelectedRegion: (regionId: number) => {
      dispatch(toggleSelectedRegion(regionId));
    },
    setZoomInToRegion: (zoomedIn: boolean) => {
      dispatch(setRegionZoom(zoomedIn));
    },
    clearSelectedRegion: () => {
      dispatch(setSelectedRegion());
    },
  }),
)(Map);
