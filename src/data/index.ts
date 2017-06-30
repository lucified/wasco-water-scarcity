import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');
import uniq = require('lodash/uniq');

import { StressShortageDatum, TimeAggregate, WorldRegion } from '../types';
import datasets from './datasets';
import {
  RawRegionStressShortageDatum,
  toStressShortageDatum,
  WaterRegionGeoJSON,
  WorldRegionGeoJSON,
} from './types';

function generateStressShortageData(
  rawData: RawRegionStressShortageDatum[],
): Array<TimeAggregate<StressShortageDatum>> {
  const yearlyGroupedData = values(groupBy(rawData, ({ y0 }) => y0)).sort(
    (a, b) => a[0].y0 - b[0].y0,
  );

  return yearlyGroupedData.map(group => ({
    startYear: group[0].y0,
    endYear: group[0].y1,
    data: keyBy(group.map(toStressShortageDatum), d => d.featureId),
  }));
}

export async function fetchHistoricalStressShortageData(
  climateModel: string,
  impactModel: string,
  timeScale: string,
): Promise<Array<TimeAggregate<StressShortageDatum>> | undefined> {
  const dataset = datasets.find(
    d =>
      d.impactModel === impactModel &&
      d.climateModel === climateModel &&
      d.timeScale === timeScale &&
      d.population === 'hist' &&
      ['NA', 'noco2'].indexOf(d.co2Forcing) > -1,
  );
  if (!dataset) {
    console.error('Unable to find dataset for', climateModel, impactModel);
    return undefined;
  }
  const { url } = dataset;

  try {
    const result = await fetch(url, { credentials: 'same-origin' });
    const parsedData: RawRegionStressShortageDatum[] = await result.json();
    return generateStressShortageData(parsedData);
  } catch (error) {
    console.error('Unable to fetch water data', url, error);
    return undefined;
  }
}

export async function fetchAllFutureData(): Promise<
  | Array<{ id: string; data: Array<TimeAggregate<StressShortageDatum>> }>
  | undefined
> {
  const futureDatasetURLs = datasets
    .filter(
      d =>
        d.population !== 'hist' &&
        d.timeScale === 'decadal' && // TODO: remove
        ['NA', 'noco2'].indexOf(d.co2Forcing) > -1,
    )
    .map(d => d.url);
  if (futureDatasetURLs.length === 0) {
    console.error('Unable to find future datasets');
    return undefined;
  }

  try {
    const results = await Promise.all(
      futureDatasetURLs.map(url => fetch(url, { credentials: 'same-origin' })),
    );
    const parsedResults: RawRegionStressShortageDatum[][] = await Promise.all(
      results.map(response => response.json()),
    );
    return parsedResults.map((data, i) => ({
      id: futureDatasetURLs[i], // Use the URL as the ID
      data: generateStressShortageData(data),
    }));
  } catch (error) {
    console.error('Unable to fetch future data', error);
    return undefined;
  }
}

export function getClimateModels() {
  return uniq(datasets.map(d => d.climateModel)).sort();
}

export function getImpactModels() {
  return uniq(datasets.map(d => d.impactModel)).sort();
}

export function getTimeScales() {
  return uniq(datasets.map(d => d.timeScale)).sort();
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

export async function fetchWorldRegionsData(): Promise<
  WorldRegion[] | undefined
> {
  const filename = require('!!file-loader!../../data/worldRegion.json');
  try {
    const result = await fetch(filename, { credentials: 'include' });
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

export async function fetchWaterRegionsData(): Promise<
  WaterRegionGeoJSON | undefined
> {
  const filename = require('!!file-loader!../../data/FPU.json');
  try {
    const result = await fetch(filename, { credentials: 'include' });
    return (await result.json()) as WaterRegionGeoJSON;
  } catch (error) {
    console.error('Unable to fetch water regions data', filename, error);
    return undefined;
  }
}
