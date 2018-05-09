import { ExtendedFeature, ExtendedFeatureCollection } from 'd3-geo';
import * as GeoJSON from 'geojson';
import { Omit } from 'recompose';
import { StressShortageDatum, TimeScale } from '../types';

export interface WorldRegionGeoJSONFeature {
  geometry: any;
  id: number;
  type: 'Feature';
  properties: {
    featureId: number;
    featureName: string;
  };
}

export interface HistoricalDataset {
  default?: boolean;
  spatialUnit: string;
  timeScale: TimeScale;
  dataType: string;
  population: string;
  impactModel: string;
  climateModel: string;
  climateExperiment: string;
  socialForcing: string;
  co2Forcing: string;
  startYear: string;
  endYear: string;
  url: string;
}

export interface FutureDataset {
  default?: boolean;
  urlTemplateEnsemble: string;
  urlTemplateScenario: string;
  variableName: 'avail' | 'consIrr' | 'pop' | 'stress' | 'short';
  impactModels: string[];
  climateModels: string[];
  populations: string[];
  climateExperiments: string[];
  yieldGaps: string[];
  dietChanges: string[];
  foodLossReds: string[];
  trades: string[];
  agriExps: string[];
  reuses: string[];
  allocs: string[];
}

export type FutureScenario = { [variable in FutureScenarioVariable]?: string };

export type FutureScenarioVariable =
  | 'population'
  | 'impactModel'
  | 'climateModel'
  | 'climateExperiment'
  | 'yieldGap'
  | 'dietChange'
  | 'foodLossRed'
  | 'trade'
  | 'agriExp'
  | 'reuse'
  | 'alloc';

export const futureScenarioKeys: FutureScenarioVariable[] = [
  'population',
  'impactModel',
  'climateModel',
  'climateExperiment',
  'yieldGap',
  'dietChange',
  'foodLossRed',
  'trade',
  'agriExp',
  'reuse',
  'alloc',
];

export interface FutureScenarioWithData extends FutureScenario {
  scenarioId: string;
  default?: boolean;
  variableName: 'avail' | 'consIrr' | 'pop' | 'stress' | 'short';
  spatialUnit: string;
  timeScale: TimeScale; // Should only be decadal
  socialForcing: string;
  co2Forcing: string;
  startYear: string;
  endYear: string;
  data: Array<{
    y0: number; // start year
    y1: number; // end year
    value: number;
  }>;
}

export type FutureEnsembleData = FutureScenarioWithData[];
export type FutureScenarioData = Array<{
  y0: number; // start year
  y1: number; // end year
  data: {
    [regionId: string]: Omit<RawRegionStressShortageDatum, 'y0' | 'y1' | 'id'>;
  };
}>;

export interface WorldRegionGeoJSON {
  type: 'FeatureCollection';
  features: WorldRegionGeoJSONFeature[];
  crs: any;
}

export interface WaterRegionGeoJSONFeature {
  geometry: any;
  id: number;
  type: 'Feature';
  properties: {
    featureId: number;
    worldRegionID: number;
  };
}

export interface WaterRegionGeoJSON {
  type: 'FeatureCollection';
  features: WaterRegionGeoJSONFeature[];
  crs: any;
}

export interface RawRegionStressShortageDatum {
  // Independent variables
  id: number; // The FPU ID or the world region ID for aggregates
  y0: number; // start year
  y1: number; // end year

  // Dependent variables
  // Average population
  pop: number;

  // Blue water availability (m3/year)
  avail: number;

  // Blue water consumption for irrigation (km3/year)
  consIrr?: number;
  // Blue water consumption for households and small businesses (domestic )(km3/year)
  consDom?: number;
  // Blue water consumption for thermal electricity production (km3/year)
  consEle?: number;
  // Blue water consumption for livestock farming (km3/year)
  consLiv?: number;
  // Blue water consumption for manufacturing industries (km3/year)
  consMfg?: number;

  // Blue water availability per capita (m3/cap/year). Includes NAs where population=0
  short: number;
  // Blue water consumption-to-availability ratio. Includes NAs where availability=0
  stress: number;
}

const KM_3_TO_M_3_RATIO = 1000000000;

export function toStressShortageDatum({
  y0,
  y1,
  id,
  avail,
  consDom,
  consEle,
  consIrr,
  consLiv,
  consMfg,
  stress,
  short,
  pop,
}: RawRegionStressShortageDatum): StressShortageDatum {
  const domestic = consDom || 0;
  const electric = consEle || 0;
  const irrigation = consIrr || 0;
  const livestock = consLiv || 0;
  const manufacturing = consMfg || 0;
  const calculatedTotal =
    domestic + electric + irrigation + livestock + manufacturing;

  return {
    startYear: y0,
    endYear: y1,
    featureId: id,
    availability: avail,
    consumptionDomestic: domestic * KM_3_TO_M_3_RATIO,
    consumptionElectric: electric * KM_3_TO_M_3_RATIO,
    consumptionIrrigation: irrigation * KM_3_TO_M_3_RATIO,
    consumptionLivestock: livestock * KM_3_TO_M_3_RATIO,
    consumptionManufacturing: manufacturing * KM_3_TO_M_3_RATIO,
    consumptionTotal: calculatedTotal * KM_3_TO_M_3_RATIO,
    stress,
    shortage: short,
    population: pop,
  };
}

interface RiverData {
  scalerank: string;
  featurecla: string;
  name: string;
  note?: string;
}

interface CountryBorder {
  featureid: number;
  countryName: string;
}

interface Basin {
  featureid: number;
  basinName: string;
}

interface PopulatedPlaces {
  name: string;
}

interface DrainageDirection {
  strahler: number;
  basin: number;
}

export type GridData = {
  centre: [number, number];
} & GridDataContents;

type GridDataContents = {
  [key in GridVariable]?: { [startYear: string]: number }
};

type GridQuintile = { [key in GridVariable]?: number[] };

export type GridVariable = 'pop' | 'elec' | 'dom' | 'man' | 'live' | 'irri';

export interface LocalData {
  basins?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiPolygon, Basin>
  >;
  places?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.Point, PopulatedPlaces>
  >;
  countries?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiPolygon, CountryBorder>
  >;
  rivers?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.MultiLineString, RiverData>
  >;
  ddm?: ExtendedFeatureCollection<
    ExtendedFeature<GeoJSON.Point, DrainageDirection>
  >;
  grid: GridData[];
  gridQuintiles: GridQuintile;
}
