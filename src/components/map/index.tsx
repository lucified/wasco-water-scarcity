import { extent } from 'd3-array';
import { geoGraticule, geoPath } from 'd3-geo';
import { scaleSequential, ScaleSequential } from 'd3-scale';
import { interpolateReds } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import flatMap = require('lodash/flatMap');
import values = require('lodash/values');
import * as React from 'react';
import { connect } from 'react-redux';
import { feature, mesh } from 'topojson';

import { StateTree, TimeAggregate, WaterDatum } from '../../reducers';
import { getSelectedData, getWaterData } from '../../selectors';
import { WaterRegionFeature } from './types';

// TODO: import properly once types exist
const geoInterruptedHomolosine = require('d3-geo-projection').geoInterruptedHomolosine;

// From https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
const world = require('../../../data/world-50m.json');
const waterRegions = require('../../../data/FPU.json');

const styles = require('./index.scss');

interface GeneratedStateProps {
  selectedData: TimeAggregate;
  allData: TimeAggregate[];
}

type Props = GeneratedStateProps;

const waterPropertySelector = (d: WaterDatum) => d.blueWaterStress;

class Map extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.saveSvgRef = this.saveSvgRef.bind(this);
  }

  private svgRef?: SVGElement;
  private colorScale?: ScaleSequential<string>;

  private saveSvgRef(ref: SVGElement) {
    this.svgRef = ref;
  }

  public componentDidMount() {
    this.generateScale();
    this.drawMap();
  }

  private generateScale() {
    const { allData } = this.props;
    const allWaterData = flatMap<WaterDatum[], WaterDatum>(allData.map(d => values(d.data)));
    const dataExtent = extent(allWaterData, waterPropertySelector) as [number, number];
    this.colorScale = scaleSequential(interpolateReds).clamp(true).domain(dataExtent);
  }

  private drawMap() {
    // Based on https://gist.github.com/mbostock/4448587
    const width = 1200;
    const height = 600;
    const projection = geoInterruptedHomolosine()
      .scale(180)
      .translate([width / 2, height / 2])
      .precision(.1);
    const graticule = geoGraticule();
    const path = geoPath()
      .projection(projection);

    const svg = select<SVGElement, undefined>(this.svgRef!)
      .attr('width', width)
      .attr('height', height);
    const defs = svg.select('defs');
    defs.select('#sphere')
      .datum({ type: 'Sphere' })
      .attr('d', path);

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
    const waterRegionsGroup = svg.select<SVGGElement>('g#water-regions');
    const regions = waterRegionsGroup.selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid));

    // Enter
    regions.enter().append('path')
      .attr('class', styles['water-region'])
      .attr('d', path as any)
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid));
      /*.on('mouseover', onMouseOver);
      .on('mouseout', this.onMouseOut)
      .on('click', this.onClick);

    function onMouseOver() {
      const node = select(this);
      console.log('node', node, node.data())
      console.log('event', event)
    }*/
  }

  private getColorForWaterRegion(featureId: number): string {
    const { data } = this.props.selectedData;
    return this.colorScale!(waterPropertySelector(data[featureId]));
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.selectedData !== this.props.selectedData) {
      this.redrawFills();
    }
  }

  private redrawFills() {
    const features: WaterRegionFeature[] = waterRegions.features;
    const t = transition('waterRegion').duration(100);
    select<SVGGElement, undefined>('g#water-regions').selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid))
      .transition(t)
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid));
  }

  public render() {
    return (
      <svg className={styles.svg} ref={this.saveSvgRef}>
        <defs>
          <clipPath id="clip">
            <use xlinkHref="#sphere" />
          </clipPath>
          <path id="sphere" />
        </defs>
        <use className={styles.stroke} xlinkHref="#sphere" />
        <use className={styles.fill} xlinkHref="#sphere" />
        <g>
          <path className={styles.land} clipPath="url(#clip)" />
          <path className={styles.boundary} clipPath="url(#clip)" />
          <path className={styles.graticule} clipPath="url(#clip)" />
        </g>
        <g id="water-regions" clipPath="url(#clip)" />
      </svg>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    allData: getWaterData(state),
    selectedData: getSelectedData(state),
  };
}

export default connect<GeneratedStateProps, {}, {}>(mapStateToProps)(Map);
