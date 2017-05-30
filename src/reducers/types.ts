import { RouterState } from 'react-router-redux';

export interface StateTree {
  waterData: TimeAggregate[];
  routing: RouterState;
  selections: {
    timeIndex: number;
    region?: number;
  };
}

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

export interface WaterDatum {
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

export function toWaterDatum({
  featureid,
  blueWaterConsumptionLivestock,
  blueWaterAvailability,
  blueWaterConsumptionDomestic,
  blueWaterConsumptionElectric,
  blueWaterConsumptionIrrigation,
  blueWaterShortage,
  blueWaterConsumptionTotal,
  blueWaterStress,
  population,
  blueWaterConsumptionManufacturing,
}: RawWaterDatum): WaterDatum {
  return {
    featureId: featureid,
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
  };
}
