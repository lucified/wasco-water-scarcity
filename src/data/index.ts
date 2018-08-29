// tslint:disable:max-line-length
import {
  flatMap,
  groupBy,
  keyBy,
  mapValues,
  omit,
  pick,
  uniq,
  values,
} from 'lodash';
import { feature } from 'topojson';
import {
  AnyDataType,
  FutureDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';
import { futureDatasets, historicalDataset } from './datasets';
import {
  allFutureScenarioVariables,
  FutureDataset,
  FutureDatasetVariables,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  FutureScenarioVariableName,
  FutureScenarioWithData,
  GridQuintileColors,
  GridVariable,
  HistoricalScenario,
  KcalEnsembleThreshold,
  LocalData,
  RawRegionStressShortageDatum,
  RegionSearchTerms,
  StressEnsembleThreshold,
  toStressShortageDatum,
  WaterRegionGeoJSON,
  WorldRegionGeoJSON,
} from './types';

const searchTermsFilename = require('file-loader!../../data/region_search_terms.jsonfix');

/* PAST */

const allTimeScales: TimeScale[] = ['annual', 'decadal'];

export function isTimeScale(x: any): x is TimeScale {
  return typeof x === 'string' && allTimeScales.indexOf(x as TimeScale) > -1;
}

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

function getHistoricalScenarioURL(scenario: HistoricalScenario) {
  return Object.keys(scenario).reduce(
    (url: string, variable: string) =>
      url.replace(
        `{{${variable}}}`,
        scenario[variable as keyof HistoricalScenario],
      ),
    historicalDataset.urlTemplateScenario,
  );
}

export async function fetchHistoricalStressShortageData(
  climateModel: string,
  impactModel: string,
  timeScale: TimeScale,
): Promise<Array<TimeAggregate<StressShortageDatum>> | undefined> {
  const url = getHistoricalScenarioURL({
    timeScale,
    impactModel,
    climateModel,
  });

  try {
    const result = await fetch(url, { credentials: 'same-origin' });
    const parsedData: RawRegionStressShortageDatum[] = await result.json();
    return generateStressShortageData(parsedData);
  } catch (error) {
    console.error('Unable to fetch water data', url, error);
    return undefined;
  }
}

export function getHistoricalClimateModels() {
  return historicalDataset.climateModel;
}

export function getHistoricalImpactModels() {
  return historicalDataset.impactModel;
}

export function getDefaultHistoricalClimateModel() {
  return historicalDataset.default.climateModel;
}

export function getDefaultHistoricalImpactModel() {
  return historicalDataset.default.impactModel;
}

export function toPastScenarioId(
  climateModel: string,
  impactModel: string,
  timeScale: TimeScale,
) {
  return `FPU_${timeScale}_bluewater_${impactModel}_${climateModel}`;
}

export async function getPastLocalRegionData(
  regionId: number,
  scenarioId: string,
) {
  try {
    const url = `https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/v3-20180820/local/${scenarioId}/${regionId}.json`;
    const result = await fetch(url, { credentials: 'same-origin' });
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

/* FUTURE */

export async function getFutureLocalRegionData(regionId: number) {
  try {
    const url = `https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/localdata_future_v1_20180731/${regionId}.json`;
    const result = await fetch(url, { credentials: 'same-origin' });
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

export async function fetchFutureEnsembleData(
  dataset: FutureDataset,
  featureId: string,
  dataType: FutureDataType,
): Promise<FutureEnsembleData | undefined> {
  const url = getFutureEnsembleURL(dataset, featureId, dataType);
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    const parsedResult: FutureEnsembleData = await response.json();
    return parsedResult;
  } catch (error) {
    console.error('Unable to fetch future ensemble data', error);
    return undefined;
  }
}

export const allStressEnsembleThresholds: StressEnsembleThreshold[] = [
  '0.2',
  '0.4',
  '0.6',
  '0.8',
  '1',
];

export const allKcalEnsembleThresholds: KcalEnsembleThreshold[] = [
  1000,
  1845,
  2355,
  2894,
  4000,
];

export function toEnsembleWorldId(
  worldRegionId: number,
  threshold: StressEnsembleThreshold | KcalEnsembleThreshold,
) {
  return `world-${worldRegionId}_${threshold}`;
}

export function toEnsembleRegionId(regionId: number) {
  return regionId.toString();
}

export function toFutureScenarioId(scenario: FutureScenario) {
  return allFutureScenarioVariables
    .map(variable => scenario[variable])
    .join('-');
}

export function removeDataFromScenario(
  scenarioWithData: FutureScenarioWithData,
): FutureScenario {
  return pick(scenarioWithData, allFutureScenarioVariables);
}

function getFutureEnsembleURL(
  dataset: FutureDataset,
  featureId: string,
  dataType: FutureDataType,
) {
  return dataset.urlTemplateEnsemble
    .replace('{{featureId}}', featureId)
    .replace('{{variableName}}', dataType);
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

export function getDefaultFutureScenario(): FutureScenario {
  return {
    yieldGap: 'current',
    dietChange: 'current',
    foodLossRed: 'current',
    trade: 'current volume',
    reuse: 'minwater',
    agriExp: 'current',
    // Social uncertainties
    population: 'SSP1',
    climateExperiment: 'rcp4p5',
    alloc: 'discharge',
    // Scientific uncertainties
    impactModel: 'mean',
    climateModel: 'mean',
  };
}

export function isFutureDataType(value: string): value is FutureDataType {
  const options: FutureDataType[] = ['stress', 'kcal'];
  return options.indexOf(value as FutureDataType) > -1;
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

/* COMMON */

export const defaultDataTypeThresholds: {
  [dataType in AnyDataType]: number[]
} = {
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
  /**
   * Higher is bettter.
   */
  kcal: [1000, 1845, 2355],
};

export const defaultDataTypeThresholdMaxValues: {
  [dataType in AnyDataType]: number
} = {
  stress: 2,
  shortage: 4000,
  scarcity: 1.5,
  kcal: 4000,
};

export function generateWaterToWorldRegionsMap(
  waterRegionsData: WaterRegionGeoJSON,
) {
  return waterRegionsData.features.reduce<{ [waterRegionId: number]: number }>(
    (result, region) => {
      result[region.properties.featureId] = region.properties.worldRegionID;
      return result;
    },
    {},
  );
}

// tslint:disable:no-implicit-dependencies
// FIXME: We needed to change the file extension for this in order to override
// Webpack's built-in JSON imports because it currently seems that we can't
// override JSON importing with inline loader declarations (e.g.
// require('file-loader!file.json')). Once the following issue has been
// resolved, change the filenames back to .json:
// https://github.com/webpack/webpack/issues/6586
const fpuTopojsonFilename = require('file-loader!../../data/FPU_topojson.jsonfix');

export async function fetchWaterRegionsTopojson(): Promise<
  [WaterRegionGeoJSON, WorldRegion[]] | undefined
> {
  try {
    const result = await fetch(fpuTopojsonFilename, { credentials: 'include' });
    const waterRegionTopojson: TopoJSON.Topology = await result.json();
    const waterRegionData: WaterRegionGeoJSON = feature(
      waterRegionTopojson,
      waterRegionTopojson.objects.waterRegions,
    ) as any; // TODO: fix typings
    const worldRegionsGeoJSON: WorldRegionGeoJSON = feature(
      waterRegionTopojson,
      waterRegionTopojson.objects.worldRegions,
    ) as any; // TODO: fix typings
    const worldRegionsData = generateWorldRegionsData(worldRegionsGeoJSON);
    return [waterRegionData, worldRegionsData];
  } catch (error) {
    console.error(
      'Unable to fetch water regions data',
      fpuTopojsonFilename,
      error,
    );
    return undefined;
  }
}

// Note: we currently don't have ways to get other datasets since we only have one
// at the moment.
export function getDefaultFutureDataset() {
  const dataset = futureDatasets[0];

  if (!dataset) {
    console.error('No future dataset found!');
  }

  return dataset;
}

export enum StartingPoint {
  ANYTHING_POSSIBLE,
  CHANGE_THE_WORLD,
}

export function getDefaultComparison(
  startingPoint: StartingPoint,
): FutureDatasetVariables {
  const allOptions = omit<FutureDatasetVariables>(
    getDefaultFutureDataset(),
    'urlTemplateEnsemble',
    'urlTemplateScenario',
    'variableName',
  );
  switch (startingPoint) {
    case StartingPoint.ANYTHING_POSSIBLE:
      return allOptions;
    case StartingPoint.CHANGE_THE_WORLD:
      return {
        ...allOptions,
        dietChange: ['current'],
        foodLossRed: ['current'],
        yieldGap: ['current'],
        agriExp: ['current'],
        reuse: ['minwater'],
        trade: ['current volume'],
        impactModel: ['mean'],
        climateModel: ['mean'],
      };
  }
}

export const belowThresholdColor = '#DBE4E8';
export const missingDataColor = '#807775';

export function getDataTypeColors(dataType: AnyDataType) {
  switch (dataType) {
    case 'stress':
      return ['#F59696', '#CE4B4B', '#A81818'];
    case 'shortage':
      return ['#C29FED', '#9A65DA', '#7839C5'];
    case 'scarcity':
      // [stress, stress + shortage, shortage]
      return ['#F59696', '#BB5C8B', '#C29FED'];
    case 'kcal':
      return ['#A7E595', '#48C423', '#2EA50A'];
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
    const hasStress = d.stress != null && d.stress >= stressThresholds[0];
    const hasShortage =
      d.shortage != null && d.shortage <= shortageThresholds[2];
    if (hasStress && hasShortage) {
      return scarcityThresholds[1] + 0.1;
    }

    if (hasShortage) {
      return scarcityThresholds[2] + 0.1;
    }

    if (hasStress) {
      return scarcityThresholds[0] + 0.1;
    }

    return scarcityThresholds[0] - 0.1;
  };
}

export const gridQuintileColors: GridQuintileColors = {
  pop: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
  elec: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
  dom: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
  man: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
  live: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
  irri: ['none', '#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
};

export const allGridVariables: GridVariable[] = [
  'pop',
  'irri',
  'dom',
  'man',
  // Temporarily disable display of electricity because we reuse 'man' as 'ind'
  // 'elec',
  'live',
];

export function isGridVariable(x: any): x is GridVariable {
  return (
    typeof x === 'string' && allGridVariables.indexOf(x as GridVariable) > -1
  );
}

export function labelForGridVariable(variable: GridVariable) {
  switch (variable) {
    case 'pop':
      return 'Population';
    case 'dom':
      return 'Domestic';
    case 'elec':
      return 'Electricity';
    case 'irri':
      return 'Irrigation';
    case 'live':
      return 'Livestock';
    /* Some models combine electricity and manufacturing.
    As a temporary fix, we reuse the man variable */
    case 'man':
      return 'Industry';
  }
}

export const availableImpactModels = uniq(
  historicalDataset.impactModel.concat(
    flatMap(futureDatasets, dataset => dataset.impactModel),
  ),
);

export const availableClimateModels = uniq(
  historicalDataset.climateModel.concat(
    flatMap(futureDatasets, dataset => dataset.climateModel),
  ),
);

export async function fetchRegionSearchTerms() {
  try {
    const result = await fetch(searchTermsFilename, {
      credentials: 'same-origin',
    });
    const searchTerms: RegionSearchTerms[] = await result.json();
    return searchTerms;
  } catch (error) {
    console.error('Unable to fetch search terms:', error);
    return undefined;
  }
}

export * from './types';
