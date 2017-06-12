import { axisBottom } from 'd3-axis';
import { geoPath } from 'd3-geo';
import { scaleLinear, scaleThreshold, ScaleThreshold } from 'd3-scale';
import { schemePurples, schemeReds } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { feature } from 'topojson';

import { setSelectedRegion, toggleSelectedRegion } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedData,
  getSelectedDataType,
  getSelectedRegion,
  getWaterData,
} from '../../selectors';
import {
  DataType,
  getDataTypeThresholds,
  StressShortageDatum,
  TimeAggregate,
} from '../../types';
import { WaterRegionFeature } from './types';

// TODO: import properly once types exist
const { geoNaturalEarth2 } = require('d3-geo-projection');

// From https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
const world = require('../../../data/world-50m.json');
const waterRegions = require('../../../data/FPU.json');

const styles = require('./index.scss');

interface GeneratedStateProps {
  selectedData: TimeAggregate;
  allData: TimeAggregate[];
  selectedRegion?: number;
  selectedDataType: DataType;
}

interface GeneratedDispatchProps {
  toggleSelectedRegion: (regionId: number) => void;
  clearSelectedRegion: () => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

const waterPropertySelector = (
  d: StressShortageDatum,
  dataType: DataType,
): number | undefined => d[dataType];

interface DataTypeParameter {
  dataType: DataType;
  label: string;
  thresholds: number[];
  colorScale: ScaleThreshold<number, string>;
}

const stressThresholds = getDataTypeThresholds('blueWaterStress')!;
const shortageThresholds = getDataTypeThresholds('blueWaterShortage')!;
const allDataTypeParameters: DataTypeParameter[] = [
  {
    dataType: 'blueWaterStress',
    label: 'Water stress',
    thresholds: stressThresholds,
    colorScale: scaleThreshold<number, string>()
      .domain(stressThresholds)
      .range(['#D2E3E5', ...schemeReds[stressThresholds.length + 1].slice(1)]),
  },
  {
    dataType: 'blueWaterShortage',
    label: 'Water shortage',
    thresholds: shortageThresholds,
    colorScale: scaleThreshold<number, string>()
      .domain(shortageThresholds)
      // Note: higher is better. Colors are reversed.
      .range(
        [
          '#D2E3E5',
          ...schemePurples[shortageThresholds.length + 1].slice(1),
        ].reverse(),
      ),
  },
];

class Map extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.saveSvgRef = this.saveSvgRef.bind(this);
    this.handleRegionClick = this.handleRegionClick.bind(this);
  }

  private svgRef?: SVGElement;
  private width = 1200;
  private height = this.width / 1.9;

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
      .scale(this.width / 4.6)
      .translate([this.width / 2.2, this.height / 1.7])
      .precision(0.1);
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
    const { selectedDataType } = this.props;
    const dataTypeParameters = allDataTypeParameters.find(
      d => d.dataType === selectedDataType,
    );
    if (!dataTypeParameters) {
      console.error('Unknown data type!', selectedDataType);
      return;
    }
    const { colorScale, thresholds } = dataTypeParameters;

    // Based on https://bl.ocks.org/mbostock/4060606
    const width = 200;
    const svg = select<SVGElement, undefined>(this.svgRef!);

    const maxThreshold = thresholds[thresholds.length - 1];
    const xScale = scaleLinear()
      .domain([0, 2 * maxThreshold])
      .rangeRound([0, width]);
    const g = svg.select<SVGGElement>('g#legend');

    // prettier-ignore
    g
      .selectAll('rect')
      .data(
        colorScale.range().map(d => {
          const colorExtent = colorScale.invertExtent(d);
          if (colorExtent[0] == null) {
            colorExtent[0] = xScale.domain()[0];
          }
          if (colorExtent[1] == null) {
            colorExtent[1] = xScale.domain()[1];
          }

          return colorExtent as [number, number];
        }),
      )
      .enter()
        .append('rect')
        .attr('height', 8)
        .attr('x', d => xScale(d[0]))
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        .attr('fill', d => colorScale(d[0]));

    g
      .call(axisBottom(xScale).tickSize(13).tickValues(colorScale.domain()))
      .select('.domain')
      .remove();
  }

  private redrawLegend() {
    const { selectedDataType } = this.props;
    const dataTypeParameters = allDataTypeParameters.find(
      d => d.dataType === selectedDataType,
    );
    if (!dataTypeParameters) {
      console.error('Unknown data type!', selectedDataType);
      return;
    }
    const { colorScale, thresholds } = dataTypeParameters;

    // Based on https://bl.ocks.org/mbostock/4060606
    const width = 200;
    const svg = select<SVGElement, undefined>(this.svgRef!);

    const maxThreshold = thresholds[thresholds.length - 1];
    const xScale = scaleLinear()
      .domain([0, 2 * maxThreshold])
      .rangeRound([0, width]);
    const g = svg.select<SVGGElement>('g#legend');

    // TODO: things probably screw up if we have different amounts of thresholds
    g
      .selectAll('rect')
      .data(
        colorScale.range().map(d => {
          const colorExtent = colorScale.invertExtent(d);
          if (colorExtent[0] == null) {
            colorExtent[0] = xScale.domain()[0];
          }
          if (colorExtent[1] == null) {
            colorExtent[1] = xScale.domain()[1];
          }

          return colorExtent as [number, number];
        }),
      )
      .attr('x', d => xScale(d[0]))
      .attr('width', d => xScale(d[1]) - xScale(d[0]))
      .attr('fill', d => colorScale(d[0]));

    g
      .call(axisBottom(xScale).tickSize(13).tickValues(colorScale.domain()))
      .select('.domain')
      .remove();
  }

  private handleRegionClick(d: WaterRegionFeature) {
    this.props.toggleSelectedRegion(d.properties.featureid);
  }

  private getColorForWaterRegion(featureId: number): string {
    const { selectedDataType, selectedData: { data } } = this.props;
    const dataTypeParameters =
      allDataTypeParameters.find(d => d.dataType === selectedDataType) ||
      allDataTypeParameters[0];
    const value = waterPropertySelector(data[featureId], selectedDataType);
    return value != null ? dataTypeParameters.colorScale(value) : '#807775';
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.selectedData !== this.props.selectedData ||
      prevProps.selectedRegion !== this.props.selectedRegion
    ) {
      this.redrawFillsAndBorders();
    }

    if (prevProps.selectedDataType !== this.props.selectedDataType) {
      this.redrawFillsAndBorders();
      this.redrawLegend();
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
    const dataTypeParameters = allDataTypeParameters.find(
      d => d.dataType === selectedDataType,
    );
    if (!dataTypeParameters) {
      console.error('Unknown data type!', selectedDataType);
      return null;
    }

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
          <g>
            <path className={styles.land} clipPath="url(#clip)" />
          </g>
          <g id="water-regions" clipPath="url(#clip)" />

          <g
            id="legend"
            className={styles.legend}
            transform={`translate(${this.width * 0.6}, ${this.height - 40})`}
          >
            <text className={styles['legend-caption']} x="0" y="-6">
              {dataTypeParameters.label}
            </text>
          </g>
        </svg>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    allData: getWaterData(state),
    selectedData: getSelectedData(state),
    selectedRegion: getSelectedRegion(state),
    selectedDataType: getSelectedDataType(state),
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
