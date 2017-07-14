import { WorldRegionGeoJSONFeature } from './data/types';

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
  color: string;
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

export type DataType = 'stress' | 'shortage' | 'scarcity';
export type TimeScale = 'decadal' | 'annual';

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
