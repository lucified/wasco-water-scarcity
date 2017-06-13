export interface TimeAggregate<T> {
  startYear: number;
  endYear: number;
  data: {
    [featureId: number]: T;
  };
}

export interface WorldRegionGeoJSONFeature {
  geometry: any;
  id: number;
  type: 'Feature';
  properties: {
    featureId: number;
    featureName: string;
  };
}

export interface WorldRegion {
  id: number;
  name: string;
  color: string;
  feature: WorldRegionGeoJSONFeature;
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
  blueWaterConsumptionIrrigation: number;
  // Blue water consumption for households and small businesses (domestic )(km3/year)
  blueWaterConsumptionDomestic: number;
  // Blue water consumption for thermal electricity production (km3/year)
  blueWaterConsumptionElectric: number;
  // Blue water consumption for livestock farming (km3/year)
  blueWaterConsumptionLivestock: number;
  // Blue water consumption for manufacturing industries (km3/year)
  blueWaterConsumptionManufacturing: number;
}

export interface RawRegionStressShortageDatum extends RawDatum {
  // Dependent variabls
  // What wolrd region the FPU belongs to
  worldRegionID: number;
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

export interface Datum {
  startYear: number;
  endYear: number;

  // The globalRegionID in aggregates, regionID for FPUs. Set to 0 for the globe.
  featureId: number;

  population: number;
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
  populationModerateBlueWaterShortage: number;
  populationHighBlueWaterShortage: number;

  // For stress
  populationNoBlueWaterStress: number;
  populationModerateBlueWaterStress: number;
  populationHighBlueWaterStress: number;
}

// All units have been converted to m^3 from km^3
export interface StressShortageDatum extends Datum {
  worldRegionId: number;
  blueWaterShortage: number;
  blueWaterStress: number;
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
  worldRegionID,
}: RawRegionStressShortageDatum): StressShortageDatum {
  const calculatedTotal =
    (blueWaterConsumptionDomestic +
      blueWaterConsumptionElectric +
      blueWaterConsumptionIrrigation +
      blueWaterConsumptionLivestock +
      blueWaterConsumptionManufacturing) *
    KM_3_TO_M_3_RATIO;

  return {
    startYear,
    endYear,
    featureId,
    worldRegionId: worldRegionID,
    blueWaterAvailability,
    blueWaterConsumptionDomestic:
      blueWaterConsumptionDomestic * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionElectric:
      blueWaterConsumptionElectric * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionIrrigation:
      blueWaterConsumptionIrrigation * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionLivestock:
      blueWaterConsumptionLivestock * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionManufacturing:
      blueWaterConsumptionManufacturing * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionTotal: calculatedTotal,
    blueWaterStress,
    blueWaterShortage,
    population,
  };
}

export function toAggregateStressShortageDatum({
  startYear,
  endYear,
  featureId,
  population,
  populationBlueWaterShortageAndStress,
  populationHighBlueWaterShortage,
  populationHighBlueWaterStress,
  populationModerateBlueWaterShortage,
  populationModerateBlueWaterStress,
  populationNoBlueWaterShortage,
  populationNoBlueWaterShortageAndStress,
  populationNoBlueWaterStress,
  populationOnlyBlueWaterShortage,
  populationOnlyBlueWaterStress,
}: RawAggregateStressShortageDatum) {
  return {
    startYear,
    endYear,
    featureId,
    population,
    populationBlueWaterShortageAndStress,
    populationHighBlueWaterShortage,
    populationHighBlueWaterStress,
    populationModerateBlueWaterShortage,
    populationModerateBlueWaterStress,
    populationNoBlueWaterShortage,
    populationNoBlueWaterShortageAndStress,
    populationNoBlueWaterStress,
    populationOnlyBlueWaterShortage,
    populationOnlyBlueWaterStress,
  };
}

export type DataType = 'stress' | 'shortage' | 'scarcity';
export function getDataTypeThresholds(dataType: DataType) {
  switch (dataType) {
    case 'stress':
      return [0.2, 0.4, 1];
    case 'shortage':
      return [500, 1000, 1700]; // Note: higher is better.
    case 'scarcity':
      /**
       * These numbers are arbitrary.
       * x < 0 = No stress or shortage
       * 0 <= x < 0.5 = stress only
       * 0.5 <= x < 1.0 = shortage only
       * x >= 1.0 = shortage and stress
       */
      return [0, 0.5, 1];
  }

  console.warn('No thresholds availables for', dataType);
  return undefined;
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

export function waterPropertySelector(dataType: DataType) {
  switch (dataType) {
    case 'stress':
      return (d: StressShortageDatum) => d.blueWaterStress;
    case 'shortage':
      return (d: StressShortageDatum) => d.blueWaterShortage;
    case 'scarcity':
      const stressThresholds = getDataTypeThresholds('stress')!;
      const shortageThresholds = getDataTypeThresholds('shortage')!;
      const scarcityThresholds = getDataTypeThresholds('scarcity')!;
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

  console.warn('Unknown data type', dataType);
  return (_d: StressShortageDatum) => undefined;
}
