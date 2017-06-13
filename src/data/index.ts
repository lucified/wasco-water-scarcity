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
