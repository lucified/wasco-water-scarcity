import { WorldRegionGeoJSONFeature } from './data';

export interface TimeAggregate<T> {
  startYear: number;
  endYear: number;
  data: {
    [featureId: number]: T;
  };
}

export interface WorldRegion {
  id: number;
  name: string;
  feature: WorldRegionGeoJSONFeature;
}

export interface Datum {
  startYear: number;
  endYear: number;
  // The globalRegionID in aggregates, regionID for FPUs. Set to 0 for the globe.
  featureId: number;
  population: number;
  availability: number;
  /**
   * We calculate this by taking the sum of the different consumptions. It may
   * differ slightly from the raw total value due to rounding and floating
   * numbers.
   */
  consumptionTotal: number;
  consumptionIrrigation: number;
  consumptionDomestic: number;
  consumptionElectric: number;
  consumptionLivestock: number;
  consumptionManufacturing: number;
}

// All units have been converted to m^3 from km^3
export interface AggregateStressShortageDatum extends Datum {
  // For scarcity
  populationNoShortageAndStress: number;
  populationOnlyShortage: number;
  populationOnlyStress: number;
  populationShortageAndStress: number;

  // For shortage
  populationNoShortage: number;
  populationLowShortage: number;
  populationModerateShortage: number;
  populationHighShortage: number;

  // For stress
  populationNoStress: number;
  populationLowStress: number;
  populationModerateStress: number;
  populationHighStress: number;
}

// All units have been converted to m^3 from km^3
export interface StressShortageDatum extends Datum {
  shortage: number;
  stress: number;
}

export type HistoricalDataType = 'stress' | 'shortage' | 'scarcity';
export type FutureDataType = 'stress' | 'kcal';
export type TimeScale = 'decadal' | 'annual';
