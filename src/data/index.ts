import { groupBy, keyBy, mapValues, pick, uniq, values } from 'lodash';
import {
  FutureDataType,
  HistoricalDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';
import { futureDatasets, historicalDatasets } from './datasets';
import {
  allFutureScenarioVariables,
  FutureDataset,
  FutureDatasetVariables,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  FutureScenarioVariableName,
  FutureScenarioWithData,
  LocalData,
  RawRegionStressShortageDatum,
  toStressShortageDatum,
  WaterRegionGeoJSON,
  WorldRegionGeoJSON,
} from './types';

// tslint:disable:no-implicit-dependencies
// FIXME: We needed to change the file extension for this in order to override
// Webpack's built-in JSON imports because it currently seems that we can't
// override JSON importing with inline loader declarations (e.g.
// require('file-loader!file.json')). Once the following issue has been
// resolved, change the filenames back to .json:
// https://github.com/webpack/webpack/issues/6586
const worldRegionsFilename = require('file-loader!../../data/worldRegion.jsonfix');
const fpuFilename = require('file-loader!../../data/FPU.jsonfix');

// TODO: Remove this, only for development!
// tslint:disable-next-line:max-line-length
const developmentAllData = require('file-loader!../../data-external/wasco/futuredata_v3-20180322/ensemble_fpu_decadal/stress/world-0_0.2/all.jsonfix');

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

export async function fetchFutureEnsembleData(
  dataset: FutureDataset,
  featureId: string,
): Promise<FutureEnsembleData | undefined> {
  const url =
    // TODO: remove this, only for development!
    featureId === 'world-0_0.2'
      ? developmentAllData
      : getFutureEnsembleURL(dataset, featureId);
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    const parsedResult: FutureEnsembleData = await response.json();
    return parsedResult;
  } catch (error) {
    console.error('Unable to fetch future ensemble data', error);
    return undefined;
  }
}

export function toEnsembleWorldId(worldRegionId: number) {
  return `world-${worldRegionId}_0.2`;
}

export function toEnsembleRegionId(regionId: number) {
  return regionId.toString();
}

export function toScenarioId(scenario: FutureScenario) {
  return Object.keys(scenario)
    .filter(key => !!allFutureScenarioVariables.find(d => d === key))
    .sort()
    .reduce(
      (result, key) => `${result}-${scenario[key as keyof FutureScenario]}`,
      '',
    );
}

export function removeDataFromScenario(
  scenarioWithData: FutureScenarioWithData,
): FutureScenario {
  return pick(scenarioWithData, allFutureScenarioVariables);
}

export async function fetchFutureScenarioData(
  dataset: FutureDataset,
  scenario: FutureScenario,
): Promise<FutureScenarioData | undefined> {
  const url = getFutureScenarioURL(dataset, scenario);
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    const parsedResult: FutureScenarioData = await response.json();
    return parsedResult;
  } catch (error) {
    console.error('Unable to fetch future scenario data', error);
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

export function getDefaultFutureScenario(): FutureScenario {
  return {
    yieldGap: 'current',
    dietChange: 'current',
    foodLossRed: 'current',
    trade: 'current volume',
    agriExp: 'current',
    reuse: 'minwater',
    // Social uncertainties
    population: 'SSP2',
    climateExperiment: 'rcp4p5',
    alloc: 'discharge',
    // Scientific uncertainties
    impactModel: 'watergap', // TODO: change to mean
    climateModel: 'hadgem2-es', // TODO: change to mean
  };
}

export async function getLocalRegionData(regionId: number) {
  try {
    const result = await fetch(
      // tslint:disable-next-line:max-line-length
      `https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/localdata_v1_20180318/FPU_decadal_bluewater/${regionId}.json`,
    );
    const parsedData: LocalData = await result.json();
    return parsedData;
  } catch (error) {
    console.error(
      'Unable to fetch local region data for region:',
      regionId,
      error,
    );
    return undefined;
  }
}

/* Future */
function getFutureEnsembleURL(dataset: FutureDataset, featureId: string) {
  return dataset.urlTemplateEnsemble.replace('{{featureId}}', featureId);
}

function getFutureScenarioURL(
  dataset: FutureDataset,
  scenario: FutureScenario,
) {
  return Object.keys(scenario).reduce(
    (url: string, variable: string) =>
      url.replace(
        `{{${variable}}}`,
        scenario[variable as keyof FutureScenario],
      ),
    dataset.urlTemplateScenario,
  );
}

function generateWorldRegionsData(geoJSON: WorldRegionGeoJSON): WorldRegion[] {
  return geoJSON.features.map(region => ({
    id: region.properties.featureId,
    name: region.properties.featureName,
    feature: region,
  }));
}

export function isFutureScenarioVariable(
  type: string,
): type is FutureScenarioVariableName {
  return (
    allFutureScenarioVariables.indexOf(type as FutureScenarioVariableName) > -1
  );
}

export function isScenarioEqual(a: FutureScenario, b: FutureScenario) {
  return allFutureScenarioVariables.every(key => a[key] === b[key]);
}

function toBooleanHash(arr: string[]) {
  return arr.reduce<{ [d: string]: true }>((result, d) => {
    result[d] = true;
    return result;
  }, {});
}

export function isFutureScenarioInComparisonVariables(
  comparisonVariables: FutureDatasetVariables,
) {
  const variablesHash = mapValues(comparisonVariables, toBooleanHash);
  return (scenario: FutureScenario) => {
    // Note that scenario may be a FutureScenarioWithData, which means we can't
    // just go over the keys
    return Object.keys(scenario)
      .filter(isFutureScenarioVariable)
      .every(type => !!variablesHash[type][scenario[type]]);
  };
}

export async function fetchWorldRegionsData(): Promise<
  WorldRegion[] | undefined
> {
  try {
    const result = await fetch(worldRegionsFilename, {
      credentials: 'include',
    });
    const parsedData: WorldRegionGeoJSON = await result.json();
    return generateWorldRegionsData(parsedData);
  } catch (error) {
    console.error(
      'Unable to fetch world regions data',
      worldRegionsFilename,
      error,
    );
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
  try {
    const result = await fetch(fpuFilename, { credentials: 'include' });
    return (await result.json()) as WaterRegionGeoJSON;
  } catch (error) {
    console.error('Unable to fetch water regions data', fpuFilename, error);
    return undefined;
  }
}

export function getFutureDataset(dataType: FutureDataType) {
  const dataset = futureDatasets.find(d => d.variableName === dataType);

  if (!dataset) {
    console.error('No future dataset found for dataType:', dataType);
  }

  return dataset;
}

export function getDataTypeColors(dataType: HistoricalDataType) {
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
