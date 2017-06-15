import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');

import {
  AggregateStressShortageDatum,
  Datum,
  RawDatum,
  StressShortageDatum,
  TimeAggregate,
  toAggregateStressShortageDatum,
  toStressShortageDatum,
  WorldRegion,
  WorldRegionGeoJSONFeature,
} from '../types';

function generateData<RawType extends RawDatum, OutputType extends Datum>(
  rawContents: RawType[],
  converter: (raw: RawType) => OutputType,
): Array<TimeAggregate<OutputType>> {
  const yearlyGroupedData: RawType[][] = values(
    groupBy(rawContents, ({ startYear }) => startYear),
  ).sort((a, b) => a[0].startYear - b[0].startYear);

  return yearlyGroupedData.map(group => ({
    startYear: group[0].startYear,
    endYear: group[0].endYear,
    data: keyBy(group.map(converter), d => d.featureId),
  }));
}

export function getStressShortageData(): Array<
  TimeAggregate<StressShortageDatum>
> {
  return generateData(
    require('../../data/FPU_decadal_bluewater.json'),
    toStressShortageDatum,
  );
}

export function getAggregateStressShortageData(): Array<
  TimeAggregate<AggregateStressShortageDatum>
> {
  return generateData(
    require('../../data/worldRegion_decadal_bluewater.json'),
    toAggregateStressShortageDatum,
  );
}

interface GeoJSON {
  type: 'FeatureCollection';
  features: WorldRegionGeoJSONFeature[];
  crs: any;
}

export function getWorldRegionsData(): WorldRegion[] {
  const geoJSON: GeoJSON = require('../../data/worldRegion.json');
  const regionIDs = geoJSON.features.map(r => r.properties.featureId);
  // Note: we only have 20 unique colors
  const colorScale = scaleOrdinal<number, string>()
    .domain(regionIDs)
    .range(schemeCategory20);

  return geoJSON.features.map(region => ({
    id: region.properties.featureId,
    name: region.properties.featureName,
    color: colorScale(region.properties.featureId),
    feature: region,
  }));
}

export const defaultDataTypeThresholds = {
  stress: [0.2, 0.4, 1],
  /**
   * Note: higher is better.
   */
  shortage: [500, 1000, 1700],
  /**
   * These numbers are arbitrary.
   * x < 0 = No stress or shortage
   * 0 <= x < 0.5 = stress only
   * 0.5 <= x < 1.0 = shortage only
   * x >= 1.0 = shortage and stress
   */
  scarcity: [0, 0.5, 1],
};

export const defaultDataTypeThresholdMaxValues = {
  stress: 2,
  shortage: 4000,
  scarcity: 2,
};
