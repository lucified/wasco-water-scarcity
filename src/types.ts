export interface TimeAggregate {
  startYear: number;
  endYear: number;
  data: {
    [featureId: number]: WaterDatum;
  };
}

export interface RawWaterDatum {
  featureid: number;
  startYear: number;
  endYear: number;
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

// All units have been converted to m^3 from km^3
export interface WaterDatum {
  startYear: number;
  endYear: number;
  featureId: number;
  population: number;
  blueWaterShortage: number;
  blueWaterStress: number;
  blueWaterAvailability: number;
  blueWaterConsumptionTotal: number;
  blueWaterConsumptionIrrigation: number;
  blueWaterConsumptionDomestic: number;
  blueWaterConsumptionElectric: number;
  blueWaterConsumptionLivestock: number;
  blueWaterConsumptionManufacturing: number;
}

const KM_3_TO_M_3_RATIO = 1000000000;

export function toWaterDatum({
  startYear,
  endYear,
  featureid,
  blueWaterAvailability,
  blueWaterConsumptionDomestic,
  blueWaterConsumptionElectric,
  blueWaterConsumptionIrrigation,
  blueWaterConsumptionLivestock,
  blueWaterConsumptionManufacturing,
  blueWaterConsumptionTotal,
  blueWaterStress,
  blueWaterShortage,
  population,
}: RawWaterDatum): WaterDatum {
  return {
    startYear,
    endYear,
    featureId: featureid,
    blueWaterAvailability,
    blueWaterConsumptionDomestic: blueWaterConsumptionDomestic * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionElectric: blueWaterConsumptionElectric * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionIrrigation: blueWaterConsumptionIrrigation * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionLivestock: blueWaterConsumptionLivestock * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionManufacturing: blueWaterConsumptionManufacturing * KM_3_TO_M_3_RATIO,
    blueWaterConsumptionTotal: blueWaterConsumptionTotal * KM_3_TO_M_3_RATIO,
    blueWaterStress,
    blueWaterShortage,
    population,
  };
}

export type DataType = keyof WaterDatum;
