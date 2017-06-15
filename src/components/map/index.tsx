import { axisBottom } from 'd3-axis';
import { geoPath } from 'd3-geo';
import {
  scaleLinear,
  ScaleLinear,
  scaleThreshold,
  ScaleThreshold,
} from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { event } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoom, zoomIdentity } from 'd3-zoom';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { feature } from 'topojson';

import { setSelectedRegion, toggleSelectedRegion } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedDataType,
  getSelectedRegion,
  getSelectedStressShortageData,
  getSelectedWorldRegion,
  getThresholdsForDataType,
  getWorldRegionData,
} from '../../selectors';
import {
  DataType,
  getDataTypeColors,
  scarcitySelector,
  StressShortageDatum,
  TimeAggregate,
  waterPropertySelector,
  WorldRegion,
} from '../../types';
import { WaterRegionFeature } from './types';

import WorldRegionSelector from './world-region-selector';

// TODO: import properly once types exist
const { geoNaturalEarth2 } = require('d3-geo-projection');

// From https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
const world = require('../../../data/world-50m.json');
const waterRegions = require('../../../data/FPU.json');

const styles = require('./index.scss');

interface GeneratedStateProps {
  selectedData: TimeAggregate<StressShortageDatum>;
  selectedRegion?: number;
  selectedWorldRegion: number;
  worldRegions: WorldRegion[];
  selectedDataType: DataType;
  colorScale: ScaleThreshold<number, string>;
  thresholds: number[];
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  toggleSelectedRegion: (regionId: number) => void;
  clearSelectedRegion: () => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

function getColorScale(dataType: DataType, thresholds: number[]) {
  const emptyColor = '#D2E3E5';

  const colors = dataType === 'shortage'
    ? [emptyColor, ...getDataTypeColors(dataType)].reverse()
    : [emptyColor, ...getDataTypeColors(dataType)];

  return scaleThreshold<number, string>().domain(thresholds).range(colors);
}

function getLabel(dataType: DataType) {
  switch (dataType) {
    case 'stress':
      return 'Water stress';
    case 'shortage':
      return 'Water shortage';
    case 'scarcity':
      return 'Water scarcity';
  }
}

class Map extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.saveSvgRef = this.saveSvgRef.bind(this);
    this.handleRegionClick = this.handleRegionClick.bind(this);
    this.drawLegendRectangle = this.drawLegendRectangle.bind(this);
    this.addLegendLabels = this.addLegendLabels.bind(this);
  }

  private svgRef?: SVGElement;
  private width = 1200;
  private height = this.width / 1.9;
  private legendWidth = 200;
  private colorScale?: ScaleThreshold<number, string>;
  private legendXScale?: ScaleLinear<number, number>;
  private legendExtentPairs?: Array<[number, number]>;

  private saveSvgRef(ref: SVGElement) {
    this.svgRef = ref;
  }

  public componentDidMount() {
    this.generateScales();
    this.drawMap();
    this.drawLegend();
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.selectedData !== this.props.selectedData ||
      prevProps.selectedRegion !== this.props.selectedRegion
    ) {
      this.redrawFillsAndBorders();
    }

    if (
      prevProps.selectedDataType !== this.props.selectedDataType ||
      prevProps.thresholds !== this.props.thresholds ||
      (this.props.selectedDataType === 'scarcity' &&
        (prevProps.stressThresholds !== this.props.stressThresholds ||
          prevProps.shortageThresholds !== this.props.shortageThresholds))
    ) {
      this.generateScales();
      this.redrawFillsAndBorders();
      this.redrawLegend();
    }

    if (prevProps.selectedWorldRegion !== this.props.selectedWorldRegion) {
      this.zoomToGlobalArea();
    }
  }

  private generateScales() {
    const { colorScale, thresholds } = this.props;
    // Based on https://bl.ocks.org/mbostock/4060606
    const maxThreshold = thresholds[thresholds.length - 1];
    const xScale = scaleLinear()
      .domain([0, 2 * maxThreshold])
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
    const { clearSelectedRegion, selectedRegion } = this.props;

    // Based on https://gist.github.com/mbostock/4448587
    const projection = geoNaturalEarth2()
      .precision(0.1)
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7]);
    const path = geoPath().projection(projection);

    const svg = select<SVGElement, undefined>(this.svgRef!)
      .attr('width', this.width)
      .attr('height', this.height);
    svg.select('#sphere').datum({ type: 'Sphere' }).attr('d', path);

    svg.select(`use.${styles['globe-fill']}`).on('click', clearSelectedRegion);

    // Countries land mass
    svg
      .select(`path.${styles.land}`)
      .datum(feature(world, world.objects.land))
      .attr('d', path);

    // Water regions
    const features: WaterRegionFeature[] = waterRegions.features;
    // prettier-ignore
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid))
      .enter()
        .append('path')
        .attr('class', styles['water-region'])
        .classed(styles.selected, d => selectedRegion === d.properties.featureid)
        .classed(styles.unselected, d => selectedRegion !== undefined && selectedRegion !== d.properties.featureid)
        .attr('d', path as any)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid))
        .on('click', this.handleRegionClick);
  }

  private drawLegend() {
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#legend',
    );

    // prettier-ignore
    g
      .selectAll('rect')
      .data(this.legendExtentPairs!)
      .enter()
        .append('rect')
        .attr('height', 8)
        .call(this.drawLegendRectangle);

    g.call(this.addLegendLabels);
  }

  private drawLegendRectangle(
    rect: Selection<SVGCircleElement, [number, number], any, any>,
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
      g.selectAll('.tick').select('line').remove();
    } else {
      g
        .call(
          axisBottom(this.legendXScale!)
            .tickSize(13)
            .tickValues(this.colorScale!.domain()),
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
      .selectAll('rect')
      .data(this.legendExtentPairs!)
      .call(this.drawLegendRectangle);

    g.call(this.addLegendLabels);
  }

  private zoomToGlobalArea() {
    const { selectedWorldRegion, worldRegions } = this.props;

    // Based on https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    const projection = geoNaturalEarth2()
      .precision(0.1)
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7]);

    let bounds;
    if (selectedWorldRegion !== 0) {
      const worldRegion = worldRegions.find(r => r.id === selectedWorldRegion)!;
      bounds = geoPath()
        .projection(projection)
        .bounds(worldRegion.feature as any);
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

    const svg = select<SVGElement, undefined>(this.svgRef!);
    const t = transition('zoom').duration(750);
    svg
      .transition(t)
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
    }
  }

  private handleRegionClick(d: WaterRegionFeature) {
    this.props.toggleSelectedRegion(d.properties.featureid);
  }

  private getColorForWaterRegion(featureId: number): string {
    const {
      selectedDataType,
      colorScale,
      thresholds,
      stressThresholds,
      shortageThresholds,
      selectedData: { data },
    } = this.props;
    const selector = selectedDataType === 'scarcity'
      ? scarcitySelector(thresholds, stressThresholds, shortageThresholds)
      : waterPropertySelector(selectedDataType);
    const value = selector(data[featureId]);
    return value != null ? colorScale(value) : '#807775';
  }

  private redrawFillsAndBorders() {
    const { selectedRegion } = this.props;
    const features: WaterRegionFeature[] = waterRegions.features;
    const t = transition('waterRegion').duration(100);
    select<SVGGElement, undefined>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionFeature>('path')
      .data(features, d => String(d.properties.featureid))
      .classed(styles.selected, d => selectedRegion === d.properties.featureid)
      .classed(
        styles.unselected,
        d =>
          selectedRegion !== undefined &&
          selectedRegion !== d.properties.featureid,
      )
      .transition(t)
      .attr('fill', d => this.getColorForWaterRegion(d.properties.featureid));
  }

  public render() {
    const { selectedDataType } = this.props;

    return (
      <div className="col-sm-12 col-md-12 col-lg-12">
        <svg ref={this.saveSvgRef}>
          <defs>
            <clipPath id="clip">
              <use xlinkHref="#sphere" />
            </clipPath>
            <path id="sphere" />
          </defs>
          <use className={styles['globe-fill']} xlinkHref="#sphere" />
          <g id="countries">
            <path className={styles.land} clipPath="url(#clip)" />
          </g>
          <g id="water-regions" clipPath="url(#clip)" />

          <g
            id="legend"
            className={styles.legend}
            transform={`translate(${this.width * 0.6}, ${this.height - 40})`}
          >
            <text className={styles['legend-caption']} x="0" y="-6">
              {getLabel(selectedDataType)}
            </text>
          </g>
        </svg>
        <WorldRegionSelector />
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const selectedDataType = getSelectedDataType(state);
  const thresholds = getThresholdsForDataType(state, selectedDataType);

  return {
    selectedData: getSelectedStressShortageData(state),
    selectedRegion: getSelectedRegion(state),
    selectedDataType,
    selectedWorldRegion: getSelectedWorldRegion(state),
    worldRegions: getWorldRegionData(state),
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

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(Map);
