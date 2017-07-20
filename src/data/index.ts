import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');
import uniq = require('lodash/uniq');

import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';
import { futureDatasets, historicalDatasets } from './datasets';
import {
  FutureData,
  FutureDataset,
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
  const dataset = historicalDatasets.find(
    d =>
      d.impactModel === impactModel &&
      d.climateModel === climateModel &&
      d.timeScale === timeScale &&
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

export async function fetchFutureData(
  dataset: FutureDataset,
): Promise<FutureData | undefined> {
  try {
    const response = await fetch(dataset.url, { credentials: 'same-origin' });
    const parsedResult: FutureData = await response.json();
    return parsedResult;
  } catch (error) {
    console.error('Unable to fetch future data', error);
    return undefined;
  }
}

export function getTimeScales(): TimeScale[] {
  return ['annual', 'decadal'];
}

/* Historical */
export function getHistoricalClimateModels() {
  return uniq(historicalDatasets.map(d => d.climateModel)).sort();
}

export function getHistoricalImpactModels() {
  return uniq(historicalDatasets.map(d => d.impactModel)).sort();
}

export function getDefaultHistoricalClimateModel() {
  const defaultDataset = historicalDatasets.find(d => !!d.default);
  return defaultDataset ? defaultDataset.climateModel : 'watch';
}

export function getDefaultHistoricalImpactModel() {
  const defaultDataset = historicalDatasets.find(d => !!d.default);
  return defaultDataset ? defaultDataset.impactModel : 'watergap';
}

/* Future */
export function getFutureDatasets() {
  return futureDatasets;
}

export function getDefaultFutureDataset() {
  return getFutureDatasets().find(d => !!d.default)!; // Note: we assume at least one dataset to be the default
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

export function getFutureDataset(
  dataType: 'stress' | 'shortage',
  timeScale: TimeScale,
) {
  const dataset = getFutureDatasets()
    .filter(d => d.timeScale === timeScale)
    .find(
      d =>
        dataType === 'shortage'
          ? d.variableName === 'short'
          : d.variableName === 'stress',
    );

  if (!dataset) {
    console.error('No future dataset found for dataType:', dataType);
  }

  return dataset;
}

export function getDataTypeColors(dataType: DataType) {
  switch (dataType) {
    case 'stress':
      // From d3-scale-chromatic's schemePurple
      return ['#cbc9e2', '#9e9ac8', '#6a51a3'];
    case 'shortage':
      return ['#f5f07f', '#e6dc4c', '#d7c919'];
    case 'scarcity':
      return ['#6a51a3', '#d7c919', 'rgb(203, 24, 29)'];
  }

  console.warn('Unknown data type', dataType);
  return [];
}

export function scarcitySelector(
  scarcityThresholds: number[],
  stressThresholds: number[],
  shortageThresholds: number[],
) {
  return (d: StressShortageDatum) => {
    const hasStress = d.stress >= stressThresholds[0];
    const hasShortage = d.shortage <= shortageThresholds[2];
    if (hasStress && hasShortage) {
      return scarcityThresholds[2] + 0.1;
    }

    if (hasShortage) {
      return scarcityThresholds[1] + 0.1;
    }

    if (hasStress) {
      return scarcityThresholds[0] + 0.1;
    }

    return scarcityThresholds[0] - 0.1;
  };
}

export * from './types';
