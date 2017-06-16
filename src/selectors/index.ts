import keyBy = require('lodash/keyBy');
import { createSelector } from 'reselect';

import { Data as GapminderData } from '../components/generic/gapminder';
import { StateTree } from '../reducers';
import {
  AggregateStressShortageDatum,
  DataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';

export function getStressShortageData(
  state: StateTree,
): Array<TimeAggregate<StressShortageDatum>> {
  return state.stressShortageData;
}

export function getSelectedStressShortageData(
  state: StateTree,
): TimeAggregate<StressShortageDatum> {
  return getStressShortageData(state)[getSelectedTimeIndex(state)];
}

export const getAggregateData = createSelector(
  getStressShortageData,
  getThresholds,
  (allData, thresholds) => {
    function createEmptyWorldRegionAggregate(
      featureId: number,
      startYear: number,
      endYear: number,
    ): AggregateStressShortageDatum {
      return {
        featureId,
        startYear,
        endYear,
        population: 0,
        populationNoBlueWaterShortageAndStress: 0,
        populationOnlyBlueWaterShortage: 0,
        populationOnlyBlueWaterStress: 0,
        populationBlueWaterShortageAndStress: 0,
        populationNoBlueWaterShortage: 0,
        populationLowBlueWaterShortage: 0,
        populationModerateBlueWaterShortage: 0,
        populationHighBlueWaterShortage: 0,
        populationNoBlueWaterStress: 0,
        populationLowBlueWaterStress: 0,
        populationModerateBlueWaterStress: 0,
        populationHighBlueWaterStress: 0,
        blueWaterAvailability: 0,
        blueWaterConsumptionDomestic: 0,
        blueWaterConsumptionElectric: 0,
        blueWaterConsumptionIrrigation: 0,
        blueWaterConsumptionLivestock: 0,
        blueWaterConsumptionManufacturing: 0,
        blueWaterConsumptionTotal: 0,
      };
    }

    return allData.map(timeUnit => {
      const { startYear, endYear } = timeUnit;
      const result: TimeAggregate<AggregateStressShortageDatum> = {
        startYear,
        endYear,
        data: {},
      };
      // Global aggregate
      const wholeGlobeRegion = (result.data[0] = createEmptyWorldRegionAggregate(
        0,
        startYear,
        endYear,
      ));

      Object.keys(timeUnit.data).forEach(id => {
        const region = timeUnit.data[Number(id)];
        const { worldRegionId, population } = region;
        const worldRegion =
          result.data[worldRegionId] ||
          (result.data[worldRegionId] = createEmptyWorldRegionAggregate(
            worldRegionId,
            startYear,
            endYear,
          ));

        const fieldsToAdd: Array<keyof AggregateStressShortageDatum> = [
          'population',
          'blueWaterAvailability',
          'blueWaterConsumptionTotal',
          'blueWaterConsumptionIrrigation',
          'blueWaterConsumptionDomestic',
          'blueWaterConsumptionElectric',
          'blueWaterConsumptionLivestock',
          'blueWaterConsumptionManufacturing',
        ];

        fieldsToAdd.forEach(field => {
          worldRegion[field] += (region as any)[field];
          wholeGlobeRegion[field] += (region as any)[field];
        });

        // Stress
        if (
          region.blueWaterStress == null ||
          region.blueWaterStress >= thresholds.stress[2]
        ) {
          worldRegion.populationHighBlueWaterStress += population;
          wholeGlobeRegion.populationHighBlueWaterStress += population;
        } else if (region.blueWaterStress >= thresholds.stress[1]) {
          worldRegion.populationModerateBlueWaterStress += population;
          wholeGlobeRegion.populationModerateBlueWaterStress += population;
        } else if (region.blueWaterStress >= thresholds.stress[0]) {
          worldRegion.populationLowBlueWaterStress += population;
          wholeGlobeRegion.populationLowBlueWaterStress += population;
        } else {
          worldRegion.populationNoBlueWaterStress += population;
          wholeGlobeRegion.populationNoBlueWaterStress += population;
        }

        // Shortage
        if (region.blueWaterShortage <= thresholds.shortage[0]) {
          worldRegion.populationHighBlueWaterShortage += population;
          wholeGlobeRegion.populationHighBlueWaterShortage += population;
        } else if (region.blueWaterShortage <= thresholds.shortage[1]) {
          worldRegion.populationModerateBlueWaterShortage += population;
          wholeGlobeRegion.populationModerateBlueWaterShortage += population;
        } else if (region.blueWaterShortage <= thresholds.shortage[2]) {
          worldRegion.populationLowBlueWaterShortage += population;
          wholeGlobeRegion.populationLowBlueWaterShortage += population;
        } else {
          worldRegion.populationNoBlueWaterShortage += population;
          wholeGlobeRegion.populationNoBlueWaterShortage += population;
        }

        // Scarcity
        if (
          region.blueWaterStress == null ||
          region.blueWaterStress >= thresholds.stress[0]
        ) {
          if (region.blueWaterShortage <= thresholds.shortage[2]) {
            worldRegion.populationBlueWaterShortageAndStress += population;
            wholeGlobeRegion.populationBlueWaterShortageAndStress += population;
          } else {
            worldRegion.populationOnlyBlueWaterStress += population;
            wholeGlobeRegion.populationOnlyBlueWaterStress += population;
          }
        } else if (region.blueWaterShortage <= thresholds.shortage[2]) {
          worldRegion.populationOnlyBlueWaterShortage += population;
          wholeGlobeRegion.populationOnlyBlueWaterShortage += population;
        } else {
          worldRegion.populationNoBlueWaterShortageAndStress += population;
          wholeGlobeRegion.populationNoBlueWaterShortageAndStress += population;
        }
      });

      return result;
    });
  },
);

export function getSelectedTimeIndex(state: StateTree): number {
  return state.selections.timeIndex;
}

export function getSelectedRegionId(state: StateTree): number | undefined {
  return state.selections.region;
}

export function getSelectedWorldRegionId(state: StateTree): number {
  return state.selections.worldRegion;
}

// prettier-ignore
export const getSelectedWorldRegion = createSelector<
  StateTree,
  number,
  WorldRegion[],
  WorldRegion | undefined
>(
  getSelectedWorldRegionId,
  getWorldRegionData,
  (id, regions) => regions.find(r => r.id === id),
);

export function getSelectedDataType(state: StateTree): DataType {
  return state.selections.dataType;
}

export const getTimeSeriesForSelectedRegion = createSelector(
  getSelectedRegionId,
  getStressShortageData,
  (selectedRegion, data) => {
    if (selectedRegion === undefined) {
      return undefined;
    }

    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

export const getTimeSeriesForSelectedGlobalRegion = createSelector(
  getSelectedWorldRegionId,
  getAggregateData,
  (selectedRegion, data) => {
    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

export function getWorldRegionData(state: StateTree) {
  return state.worldRegions;
}

function getThresholds(state: StateTree) {
  return state.thresholds;
}

export function getThresholdsForDataType(state: StateTree, dataType: DataType) {
  return getThresholds(state)[dataType];
}

export const getRegionsInSelectedWorldRegion = createSelector(
  getStressShortageData,
  getSelectedWorldRegionId,
  (data, selectedWorldRegion) => {
    // We assume all regions are in the first time series data object
    const regions = data[0].data;
    const regionIds = Object.keys(regions).map(Number);

    if (selectedWorldRegion === 0) {
      return regionIds;
    }

    const regionsInSelectedWorldRegion: number[] = [];
    regionIds.forEach(regionId => {
      if (regions[regionId].worldRegionId === selectedWorldRegion) {
        regionsInSelectedWorldRegion.push(regionId);
      }
    });

    return regionsInSelectedWorldRegion;
  },
);

// Note: this function removes zero and negative values from the
// stress and shortage data.
// prettier-ignore
export const getDataByRegion = createSelector(
  getStressShortageData,
  getWorldRegionData,
  (stressShortageData, worldRegions) => {
    const timeRanges = stressShortageData.map(
      d =>
        [new Date(d.startYear, 0, 1), new Date(d.endYear, 11, 31)] as [
          Date,
          Date
        ],
    );

    function toPositiveNumber(n?: number) {
      if (n && n > 0) {
        return n;
      }

      return 1e-7;
    }

    // Note: this assums the first data object has all region IDs
    const regionObjects = Object.keys(stressShortageData[0].data).map(id => {
      const regionId = Number(id);
      const worldRegionId = stressShortageData[0].data[regionId].worldRegionId;
      const worldRegion = worldRegions.find(r => r.id === worldRegionId);
      const color = worldRegion ? worldRegion.color : 'lightblue';
      const blueWaterStress: number[] = [];
      const blueWaterShortage: number[] = [];
      const population: number[] = [];

      stressShortageData.forEach(d => {
        const regionData = d.data[regionId];
        // The log scales can't have numbers at or below 0
        blueWaterStress.push(toPositiveNumber(regionData.blueWaterStress));
        blueWaterShortage.push(toPositiveNumber(regionData.blueWaterShortage));
        population.push(regionData.population || 0);
      });

      return {
        id,
        color,
        data: {
          blueWaterStress,
          blueWaterShortage,
          population,
        },
      };
    });

    const result: GapminderData = {
      timeRanges,
      circles: keyBy(regionObjects, d => d.id),
    };

    return result;
  },
);
