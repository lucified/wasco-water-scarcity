import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
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
import { defaultDataTypeThresholdMaxValues } from '../../data';
import {
  getDataTypeColors,
  WaterRegionGeoJSON,
  WaterRegionGeoJSONFeature,
} from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedDataType,
  getSelectedWaterRegionId,
  getSelectedWorldRegion,
  getThresholdsForDataType,
} from '../../selectors';
import { DataType, TimeAggregate, WorldRegion } from '../../types';

// TODO: import properly once types exist
const { geoNaturalEarth2 } = require('d3-geo-projection');

const worldData = require('world-atlas/world/110m.json');

const styles = require('./index.scss');

interface PassedProps {
  width: number;
  selectedData: TimeAggregate<number>;
  waterRegions: WaterRegionGeoJSON;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegion?: WorldRegion;
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

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;

function getColorScale(dataType: DataType, thresholds: number[]) {
  const emptyColor = '#D2E3E5';

  const colors =
    dataType === 'shortage'
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

class Map extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

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

  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.selectedData !== this.props.selectedData ||
      prevProps.selectedWaterRegionId !== this.props.selectedWaterRegionId
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
    svg.select('#sphere').datum({ type: 'Sphere' }).attr('d', path);

    svg.select(`use.${styles['globe-fill']}`).on('click', clearSelectedRegion);

    // Countries land mass
    svg
      .select(`path.${styles.land}`)
      .datum(feature(worldData, worldData.objects.land))
      .attr('d', path);

    // Water regions
    // prettier-ignore
    svg
      .select<SVGGElement>('g#water-regions')
      .selectAll<SVGPathElement, WaterRegionGeoJSONFeature>('path')
      .data(features, d => String(d.properties.featureId))
      .enter()
      .append('path')
        .attr('class', styles['water-region'])
        .classed(
          styles.selected,
          d => selectedWaterRegionId === d.properties.featureId,
        )
        .classed(
          styles.unselected,
          d =>
            selectedWaterRegionId !== undefined &&
            selectedWaterRegionId !== d.properties.featureId,
        )
        .attr('d', path as any)
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
            .tickValues(this.colorScale!.domain())
            .tickFormat(
              selectedDataType === 'stress' ? format('.2f') : format('d'),
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
      .selectAll('rect')
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
    svg.select('g#selected-region').select('path').remove();
    if (selectedWorldRegion) {
      const path = geoPath().projection(projection);
      bounds = path.bounds(selectedWorldRegion.feature as any);
      svg
        .select('g#selected-region')
        .append('path')
        .datum(selectedWorldRegion.feature)
        .attr('d', path as any);
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
      select<SVGGElement, undefined>('g#selected-region').attr(
        'transform',
        event.transform,
      );
    }
  }

  private handleRegionClick(d: WaterRegionGeoJSONFeature) {
    this.props.toggleSelectedRegion(d.properties.featureId);
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
        styles.selected,
        d => selectedWaterRegionId === d.properties.featureId,
      )
      .classed(
        styles.unselected,
        d =>
          selectedWaterRegionId !== undefined &&
          selectedWaterRegionId !== d.properties.featureId,
      )
      .transition(t)
      .attr('fill', d => this.getColorForWaterRegion(d.properties.featureId));
  }

  public render() {
    const { selectedDataType } = this.props;

    return (
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
          id="selected-region"
          className={styles['selected-region']}
          clipPath="url(#clip)"
        />
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
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const selectedDataType = getSelectedDataType(state);
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
  PassedProps
>(mapStateToProps, mapDispatchToProps)(Map);
