import { StressShortageDatum } from '../types';

export interface WorldRegionGeoJSONFeature {
  geometry: any;
  id: number;
  type: 'Feature';
  properties: {
    featureId: number;
    featureName: string;
  };
}

export interface Dataset {
  spatialUnit: string;
  timeScale: string;
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

export interface RawDatum {
  // Independent variables
  featureId: number; // The FPU ID or the world region ID for aggregates
  startYear: number;
  endYear: number;

  // Dependent variables
  // Average population
  population: number;
  // Blue water availability (m3/year)
  blueWaterAvailability: number;
  // Total blue water consumption (km3/year)
  blueWaterConsumptionTotal: number;
  // Blue water consumption for irrigation (km3/year)
  blueWaterConsumptionIrrigation?: number;
  // Blue water consumption for households and small businesses (domestic )(km3/year)
  blueWaterConsumptionDomestic?: number;
  // Blue water consumption for thermal electricity production (km3/year)
  blueWaterConsumptionElectric?: number;
  // Blue water consumption for livestock farming (km3/year)
  blueWaterConsumptionLivestock?: number;
  // Blue water consumption for manufacturing industries (km3/year)
  blueWaterConsumptionManufacturing?: number;
}

export interface RawRegionStressShortageDatum extends RawDatum {
  // Blue water availability per capita (m3/cap/year). Includes NAs where population=0
  blueWaterShortage: number;
  // Blue water consumption-to-availability ratio. Includes NAs where availability=0
  blueWaterStress: number;
}

export interface RawAggregateStressShortageDatum extends RawDatum {
  // Dependent variables
  // aggregated from finer scale data: sum(population[blueWaterShortage<=1700 & blueWaterStress<0.2])
  populationOnlyBlueWaterShortage: number;
  // aggregated from finer scale data: sum(population[blueWaterShortage>1700 & blueWaterStress>=0.2])
  populationOnlyBlueWaterStress: number;
  // aggregated from finer scale data: sum(population[blueWaterShortage<=1700 & blueWaterStress>=0.2])
  populationBlueWaterShortageAndStress: number;
  // aggregated from finer scale data: sum(population[blueWaterShortage<=1700 & blueWaterShortage>1000])
  populationModerateBlueWaterShortage: number;
  // aggregated from finer scale data: sum(population[blueWaterShortage<=1000])
  populationHighBlueWaterShortage: number;
  // aggregated from finer scale data: sum(population[blueWaterStress>=0.2 & blueWaterStress<0.4])
  populationModerateBlueWaterStress: number;
  // aggregated from finer scale data: sum(population[blueWaterStress>=0.4])
  populationHighBlueWaterStress: number;
  populationNoBlueWaterShortageAndStress: number;
  populationNoBlueWaterShortage: number;
  populationNoBlueWaterStress: number;
}

const KM_3_TO_M_3_RATIO = 1000000000;

export function toStressShortageDatum({
  startYear,
  endYear,
  featureId,
  blueWaterAvailability,
  blueWaterConsumptionDomestic,
  blueWaterConsumptionElectric,
  blueWaterConsumptionIrrigation,
  blueWaterConsumptionLivestock,
  blueWaterConsumptionManufacturing,
  blueWaterStress,
  blueWaterShortage,
  population,
}: RawRegionStressShortageDatum): StressShortageDatum {
  const domestic = blueWaterConsumptionDomestic || 0;
  const electric = blueWaterConsumptionElectric || 0;
  const irrigation = blueWaterConsumptionIrrigation || 0;
  const livestock = blueWaterConsumptionLivestock || 0;
  const manufacturing = blueWaterConsumptionManufacturing || 0;
  const calculatedTotal =
    (domestic + electric + irrigation + livestock + manufacturing) *
    KM_3_TO_M_3_RATIO;

  return {
    startYear,
    endYear,
    featureId,
    blueWaterAvailability,
    blueWaterConsumptionDomestic: domestic * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionElectric: electric * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionIrrigation: irrigation * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionLivestock: livestock * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionManufacturing: manufacturing * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionTotal: calculatedTotal,
    blueWaterStress,
    blueWaterShortage,
    population,
  };
}
