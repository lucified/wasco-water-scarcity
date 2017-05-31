declare module 'd3-scale-chromatic' {
  const schemeReds: string[][];
  const schemeBlues: string[][];
}

import { axisBottom } from 'd3-axis';
import { geoGraticule, geoPath } from 'd3-geo';
import { scaleLinear, scaleThreshold } from 'd3-scale';
import { schemeReds } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { feature, mesh } from 'topojson';

import { setSelectedRegion, toggleSelectedRegion } from '../../actions';
import { StateTree, TimeAggregate, WaterDatum } from '../../reducers';
import { getSelectedData, getSelectedRegion, getWaterData } from '../../selectors';
import { WaterRegionFeature } from './types';

// TODO: import properly once types exist
const geoNaturalEarth2 = require('d3-geo-projection').geoNaturalEarth2;

// From https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
const world = require('../../../data/world-50m.json');
const waterRegions = require('../../../data/FPU.json');

const styles = require('./index.scss');

interface GeneratedStateProps {
  selectedData: TimeAggregate;
  allData: TimeAggregate[];
  selectedRegion?: number;
}

interface GeneratedDispatchProps {
  toggleSelectedRegion: (regionId: number) => void;
  clearSelectedRegion: () => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

const waterPropertySelector = (d: WaterDatum): number | undefined => d.blueWaterStress;

class Map extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.saveSvgRef = this.saveSvgRef.bind(this);
    this.handleRegionClick = this.handleRegionClick.bind(this);
  }

  private svgRef?: SVGElement;
  private width = 1000;
  private height = this.width / 2;
  private thresholds = [0.2, 0.4, 1];
  private colorScale = scaleThreshold<number, string>()
    .domain(this.thresholds)
    .range(['#D2E3E5', ...schemeReds[this.thresholds.length + 1].slice(1)]);

  private saveSvgRef(ref: SVGElement) {
    this.svgRef = ref;
  }

  public componentDidMount() {
    this.drawMap();
    this.drawLegend();
  }

  private drawMap() {
    const { clearSelectedRegion, selectedRegion } = this.props;

    // Based on https://gist.github.com/mbostock/4448587
    const projection = geoNaturalEarth2()
      .scale(this.width / 4.85)
      .translate([this.width / 2.2, this.height / 1.7])
      .precision(.1);
    const graticule = geoGraticule();
    const path = geoPath()
      .projection(projection);

    const svg = select<SVGElement, undefined>(this.svgRef!)
      .attr('width', this.width)
      .attr('height', this.height);
    svg.select('#sphere')
      .datum({ type: 'Sphere' })
      .attr('d', path);

    svg.select(`use.${styles['globe-fill']}`)
      .on('click', clearSelectedRegion);

    // Countries and graticule
    svg.select(`path.${styles.graticule}`)
      .datum(graticule)
      .attr('d', path);
    svg.select(`path.${styles.land}`)
      .datum(feature(world, world.objects.land))
      .attr('d', path);
    svg.select(`path.${styles.boundary}`)
      .datum(mesh(world, world.objects.countries, (a: any, b: any) => a !== b))
      .attr('d', path);

    // Water regions
    const features: WaterRegionFeature[] = waterRegions.features;
    svg.select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid))
      .enter().append('path')
        .attr('class', styles['water-region'])
        .classed(styles.selected, d => selectedRegion === d.properties.featureid)
        .attr('d', path as any)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid))
        .on('click', this.handleRegionClick);
  }

  private drawLegend() {
    // Based on https://bl.ocks.org/mbostock/4060606
    const width = 200;
    const svg = select<SVGElement, undefined>(this.svgRef!);

    const xScale = scaleLinear()
      .domain([0, this.thresholds[this.thresholds.length - 1] + 1])
      .rangeRound([0, width]);
    const g = svg.select<SVGGElement>('g#legend');

    g.selectAll('rect')
      .data(this.colorScale.range().map(d => {
          const colorExtent = this.colorScale.invertExtent(d);
          if (colorExtent[0] == null) {
            colorExtent[0] = xScale.domain()[0];
          }
          if (colorExtent[1] == null) {
            colorExtent[1] = xScale.domain()[1];
          }

          return colorExtent as [number, number];
        }))
      .enter().append('rect')
        .attr('height', 8)
        .attr('x', d => xScale(d[0]))
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        .attr('fill', d => this.colorScale(d[0]));

    g.append('text')
      .attr('class', 'caption')
      .attr('x', xScale.range()[0])
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text('Water stress');

    g.call(axisBottom(xScale)
        .tickSize(13)
        .tickValues(this.colorScale.domain()))
      .select('.domain')
        .remove();
  }

  private handleRegionClick(d: WaterRegionFeature) {
    this.props.toggleSelectedRegion(d.properties.featureid);
  }

  private getColorForWaterRegion(featureId: number): string {
    const { data } = this.props.selectedData;
    const value = waterPropertySelector(data[featureId]);
    return value != null ? this.colorScale(value) : '#807775';
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.selectedData !== this.props.selectedData ||
      prevProps.selectedRegion !== this.props.selectedRegion
    ) {
      this.redrawFillsAndBorders();
    }
  }

  private redrawFillsAndBorders() {
    const { selectedRegion } = this.props;
    const features: WaterRegionFeature[] = waterRegions.features;
    const t = transition('waterRegion').duration(100);
    select<SVGGElement, undefined>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid))
      .classed(styles.selected, d => selectedRegion === d.properties.featureid)
      .transition(t)
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid));
  }

  public render() {
    return (
      <svg ref={this.saveSvgRef}>
        <defs>
          <clipPath id="clip">
            <use xlinkHref="#sphere" />
          </clipPath>
          <path id="sphere" />
        </defs>
        <use className={styles['globe-stroke']} xlinkHref="#sphere" />
        <use className={styles['globe-fill']} xlinkHref="#sphere" />
        <g>
          <path className={styles.land} clipPath="url(#clip)" />
          <path className={styles.boundary} clipPath="url(#clip)" />
          <path className={styles.graticule} clipPath="url(#clip)" />
        </g>
        <g id="water-regions" clipPath="url(#clip)" />
        <g id="legend" transform={`translate(${this.width * 0.6}, ${this.height - 40})`} />
      </svg>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    allData: getWaterData(state),
    selectedData: getSelectedData(state),
    selectedRegion: getSelectedRegion(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    toggleSelectedRegion: (regionId: number) => { dispatch(toggleSelectedRegion(regionId)); },
    clearSelectedRegion: () => { dispatch(setSelectedRegion()); },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
