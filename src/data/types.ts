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
  url: string;
  variableName: 'avail' | 'consIrr' | 'pop' | 'stress' | 'short';
  timeScale: TimeScale;
  impactModels: string[];
  climateModels: string[];
  populations: string[];
  climateExperiments: string[];
}

export interface FutureDataForModel {
  scenarioId: string;
  default?: boolean;
  variableName: 'avail' | 'consIrr' | 'pop' | 'stress' | 'short';
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
  data: Array<{
    y0: number; // start year
    y1: number; // end year
    value: number;
  }>;
}

export type FutureData = FutureDataForModel[];

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
