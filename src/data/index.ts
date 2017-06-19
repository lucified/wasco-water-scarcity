import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');

import { StressShortageDatum, TimeAggregate, WorldRegion } from '../types';
import {
  RawRegionStressShortageDatum,
  toStressShortageDatum,
  WaterRegionGeoJSON,
  WorldRegionGeoJSON,
} from './types';

function generateStressShortageData(
  rawData: RawRegionStressShortageDatum[],
): Array<TimeAggregate<StressShortageDatum>> {
  const yearlyGroupedData = values(
    groupBy(rawData, ({ startYear }) => startYear),
  ).sort((a, b) => a[0].startYear - b[0].startYear);

  return yearlyGroupedData.map(group => ({
    startYear: group[0].startYear,
    endYear: group[0].endYear,
    data: keyBy(group.map(toStressShortageDatum), d => d.featureId),
  }));
}

export async function fetchStressShortageData(
  filename: string,
): Promise<Array<TimeAggregate<StressShortageDatum>> | undefined> {
  try {
    const result = await fetch(filename);
    const parsedData: RawRegionStressShortageDatum[] = await result.json();
    return generateStressShortageData(parsedData);
  } catch (error) {
    console.error('Unable to fetch water data', filename, error);
    return undefined;
  }
}

function generateWorldRegionsData(geoJSON: WorldRegionGeoJSON): WorldRegion[] {
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

export async function fetchWorldRegionsData(
  filename: string,
): Promise<WorldRegion[] | undefined> {
  try {
    const result = await fetch(filename);
    const parsedData: WorldRegionGeoJSON = await result.json();
    return generateWorldRegionsData(parsedData);
  } catch (error) {
    console.error('Unable to fetch world regions data', filename, error);
    return undefined;
  }
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

export function generateWaterToWorldRegionsMap(
  waterRegionsData: WaterRegionGeoJSON,
) {
  const map: { [waterRegionId: number]: number } = {};
  waterRegionsData.features.forEach(feature => {
    map[feature.properties.featureId] = feature.properties.worldRegionID;
  });
  return map;
}

export async function fetchWaterRegionsData(
  filename: string,
): Promise<WaterRegionGeoJSON | undefined> {
  try {
    const result = await fetch(filename);
    return (await result.json()) as WaterRegionGeoJSON;
  } catch (error) {
    console.error('Unable to fetch water regions data', filename, error);
    return undefined;
  }
}
