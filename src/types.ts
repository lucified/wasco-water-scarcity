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
  blueWaterAvailability: number;
  /**
   * We calculate this by taking the sum of the different consumptions. It may
   * differ slightly from the raw total value due to rounding and floating
   * numbers.
   */
  blueWaterConsumptionTotal: number;
  blueWaterConsumptionIrrigation: number;
  blueWaterConsumptionDomestic: number;
  blueWaterConsumptionElectric: number;
  blueWaterConsumptionLivestock: number;
  blueWaterConsumptionManufacturing: number;
}

// All units have been converted to m^3 from km^3
export interface AggregateStressShortageDatum extends Datum {
  // For scarcity
  populationNoBlueWaterShortageAndStress: number;
  populationOnlyBlueWaterShortage: number;
  populationOnlyBlueWaterStress: number;
  populationBlueWaterShortageAndStress: number;

  // For shortage
  populationNoBlueWaterShortage: number;
  populationLowBlueWaterShortage: number;
  populationModerateBlueWaterShortage: number;
  populationHighBlueWaterShortage: number;

  // For stress
  populationNoBlueWaterStress: number;
  populationLowBlueWaterStress: number;
  populationModerateBlueWaterStress: number;
  populationHighBlueWaterStress: number;
}

// All units have been converted to m^3 from km^3
export interface StressShortageDatum extends Datum {
  blueWaterShortage: number;
  blueWaterStress: number;
}

export type DataType = 'stress' | 'shortage' | 'scarcity';

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

export function waterPropertySelector(dataType: 'stress' | 'shortage') {
  switch (dataType) {
    case 'stress':
      return (d: StressShortageDatum) => d.blueWaterStress;
    case 'shortage':
      return (d: StressShortageDatum) => d.blueWaterShortage;
  }
}

export function scarcitySelector(
  scarcityThresholds: number[],
  stressThresholds: number[],
  shortageThresholds: number[],
) {
  return (d: StressShortageDatum) => {
    const hasStress = d.blueWaterStress >= stressThresholds[0];
    const hasShortage = d.blueWaterShortage <= shortageThresholds[2];
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
