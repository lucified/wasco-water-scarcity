export interface TimeAggregate<T> {
  startYear: number;
  endYear: number;
  data: {
    [featureId: number]: T;
  };
}

export interface RawRegionStressShortageDatum {
  // Independent variables
  featureid: number;
  startYear: number;
  endYear: number;

  // Dependent variabls
  worldRegionID: number;
  // Average population
  population: number;
  // Blue water availability per capita (m3/cap/year). Includes NAs where population=0
  blueWaterShortage: number;
  // Blue water consumption-to-availability ratio. Includes NAs where availability=0
  blueWaterStress: number;
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

export interface RawAggregateStressShortageDatum {
  // Independent variables
  // This is the worldRegionId in RawRegionStressShortageDatum. Set to 0 for the whole world.
  featureId: number;
  startYear: number;
  endYear: number;

  // Dependent variables
  // Average population
  population: number;
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

// All units have been converted to m^3 from km^3
export interface AggregateStressShortageDatum {
  startYear: number;
  endYear: number;
  // The globalRegionID. Set to 0 for the globe.
  featureId: number;

  population: number;

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
export interface StressShortageDatum {
  startYear: number;
  endYear: number;
  featureId: number;
  population: number;
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
  featureid,
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
    featureId: featureid,
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
       * x < 0 = No high stress or shortage
       * 0 <= x < 0.5 = High stress only
       * 0.5 <= x < 1.0 = High shortage only
       * x >= 1.0 = High shortage and stress
       */
      return [0, 0.5, 1];
  }

  console.warn('No thresholds availables for', dataType);
  return undefined;
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
        const highStress = d.blueWaterStress >= stressThresholds[2];
        const highShortage = d.blueWaterShortage <= shortageThresholds[0];
        if (highStress && highShortage) {
          return scarcityThresholds[2] + 0.1;
        }

        if (highShortage) {
          return scarcityThresholds[1] + 0.1;
        }

        if (highStress) {
          return scarcityThresholds[0] + 0.1;
        }

        return scarcityThresholds[0] - 1;
      };
  }

  console.warn('Unknown data type', dataType);
  return (_d: StressShortageDatum) => undefined;
}
