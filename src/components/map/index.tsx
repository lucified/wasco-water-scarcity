import { geoGraticule, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import * as React from 'react';
import { feature, mesh } from 'topojson';

// TODO: import properly once types exist
const geoInterruptedHomolosine = require('d3-geo-projection').geoInterruptedHomolosine;

// From https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
const world = require('../../../data/world-50m.json');

const styles = require('./index.scss');

class Map extends React.Component<{}, void> {
  constructor() {
    super();

    this.saveSvgRef = this.saveSvgRef.bind(this);
  }

  private svgRef?: SVGElement;

  private saveSvgRef(ref: SVGElement) {
    this.svgRef = ref;
  }

  public componentDidMount() {
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
    const svg = select(this.svgRef!)
        .attr('width', width)
        .attr('height', height);
    const defs = svg.select('defs');
    defs.append('path')
        .datum({ type: 'Sphere' })
        .attr('id', 'sphere')
        .attr('d', path);

    svg.append('path')
        .datum(graticule)
        .attr('class', styles.graticule)
        .attr('clip-path', 'url(#clip)')
        .attr('d', path);
    svg.insert('path', `.${styles.graticule}`)
        .datum(feature(world, world.objects.land))
        .attr('class', styles.land)
        .attr('clip-path', 'url(#clip)')
        .attr('d', path);
    svg.insert('path', `.${styles.graticule}`)
        .datum(mesh(world, world.objects.countries, (a: any, b: any) => a !== b))
        .attr('class', styles.boundary)
        .attr('clip-path', 'url(#clip)')
        .attr('d', path);
  }

  public render() {
    return (
      <svg className={styles.svg} ref={this.saveSvgRef}>
        <defs>
          <clipPath id="clip">
            <use xlinkHref="#sphere" />
          </clipPath>
        </defs>
        <use className={styles.stroke} xlinkHref="#sphere" />
        <use className={styles.fill} xlinkHref="#sphere" />
      </svg>
    );
  }
}

export default Map;
