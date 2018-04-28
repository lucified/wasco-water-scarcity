import { keyBy, mapValues } from 'lodash';
import { createSelector } from 'reselect';
import { Data as GapminderData } from './components/generic/gapminder';
import { FutureScenario, FutureScenarioWithData, toScenarioId } from './data';
import { StateTree } from './reducers';
import {
  AggregateStressShortageDatum,
  HistoricalDataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from './types';

function getStressShortageData(
  state: StateTree,
): Array<TimeAggregate<StressShortageDatum>> | undefined {
  return state.data.stressShortageData;
}

export function getSelectedStressShortageData(
  state: StateTree,
): TimeAggregate<StressShortageDatum> | undefined {
  const data = getStressShortageData(state);
  return data && data[getSelectedHistoricalTimeIndex(state)];
}

export function getSelectedFutureTimeIndex(state: StateTree) {
  return state.selections.futureTimeIndex;
}

export function getSelectedFutureDataset(state: StateTree) {
  return state.selections.futureDataset;
}

function getFutureEnsembleData(state: StateTree) {
  return state.data.futureEnsembleData;
}

function getFutureScenarioData(state: StateTree) {
  return state.data.futureScenarioData;
}

export function getSelectedFutureFilters(state: StateTree) {
  return state.selections.futureFilters;
}

export function isHistoricalTimeIndexLocked(state: StateTree) {
  return state.selections.lockHistoricalTimeIndex;
}

export function isFutureScenarioLocked(state: StateTree) {
  return state.selections.lockFutureScenario;
}

export function getAllScenariosInSelectedFutureDataset(
  state: StateTree,
): FutureScenarioWithData[] | undefined {
  const allFutureData = getFutureEnsembleData(state);
  const { variableName } = getSelectedFutureDataset(state);
  return allFutureData[variableName];
}

export const getFilteredScenariosInSelectedFutureDataset = createSelector(
  getAllScenariosInSelectedFutureDataset,
  getSelectedFutureFilters,
  (scenarios, filters) =>
    scenarios &&
    scenarios.filter(
      d =>
        !!filters.climateExperiments.find(f => f === d.climateExperiment) &&
        !!filters.climateModels.find(f => f === d.climateModel) &&
        !!filters.impactModels.find(f => f === d.impactModel) &&
        !!filters.populations.find(f => f === d.population),
    ),
);

export const getEnsembleDataForSelectedFutureScenario = createSelector(
  getAllScenariosInSelectedFutureDataset,
  getSelectedFutureScenario,
  (datasetData, scenario) =>
    datasetData &&
    scenario &&
    datasetData.find(d =>
      Object.keys(scenario).every(
        key =>
          d[key as keyof FutureScenario] ===
          scenario[key as keyof FutureScenario],
      ),
    ),
);

export const getMapDataForSelectedFutureScenario = createSelector(
  getFutureScenarioData,
  getSelectedFutureScenario,
  getSelectedFutureTimeIndex,
  getSelectedFutureDataType,
  (data, scenario, timeIndex, dataType) => {
    if (!scenario) {
      return undefined;
    }

    const scenarioData = data[toScenarioId(scenario)];
    if (!scenarioData) {
      return undefined;
    }

    const { y0: startYear, y1: endYear, data: timeData } = scenarioData[
      timeIndex
    ];
    return {
      startYear,
      endYear,
      // TODO: dataType can be e.g. "shortage" which does not exist on d
      data: mapValues(timeData, d => d[dataType as 'stress'] as number),
    };
  },
);

const getAggregateData = createSelector(
  getStressShortageData,
  getThresholds,
  getWaterToWorldRegionMap,
  (allData, thresholds, waterToWorldRegionMap) => {
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
        populationNoShortageAndStress: 0,
        populationOnlyShortage: 0,
        populationOnlyStress: 0,
        populationShortageAndStress: 0,
        populationNoShortage: 0,
        populationLowShortage: 0,
        populationModerateShortage: 0,
        populationHighShortage: 0,
        populationNoStress: 0,
        populationLowStress: 0,
        populationModerateStress: 0,
        populationHighStress: 0,
        availability: 0,
        consumptionDomestic: 0,
        consumptionElectric: 0,
        consumptionIrrigation: 0,
        consumptionLivestock: 0,
        consumptionManufacturing: 0,
        consumptionTotal: 0,
      };
    }

    if (!allData || !waterToWorldRegionMap) {
      return undefined;
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

      Object.keys(timeUnit.data)
        .map(Number)
        .forEach(id => {
          const region = timeUnit.data[id];
          const worldRegionId = waterToWorldRegionMap[id];
          if (worldRegionId == null) {
            console.warn(`No world region ID available for region ${id}`);
            return;
          }
          const { population } = region;
          const worldRegion =
            result.data[worldRegionId] ||
            (result.data[worldRegionId] = createEmptyWorldRegionAggregate(
              worldRegionId,
              startYear,
              endYear,
            ));

          const fieldsToAdd: Array<keyof AggregateStressShortageDatum> = [
            'population',
            'availability',
            'consumptionTotal',
            'consumptionIrrigation',
            'consumptionDomestic',
            'consumptionElectric',
            'consumptionLivestock',
            'consumptionManufacturing',
          ];

          fieldsToAdd.forEach(field => {
            worldRegion[field] += (region as any)[field];
            wholeGlobeRegion[field] += (region as any)[field];
          });

          // Stress
          if (region.stress == null || region.stress >= thresholds.stress[2]) {
            worldRegion.populationHighStress += population;
            wholeGlobeRegion.populationHighStress += population;
          } else if (region.stress >= thresholds.stress[1]) {
            worldRegion.populationModerateStress += population;
            wholeGlobeRegion.populationModerateStress += population;
          } else if (region.stress >= thresholds.stress[0]) {
            worldRegion.populationLowStress += population;
            wholeGlobeRegion.populationLowStress += population;
          } else {
            worldRegion.populationNoStress += population;
            wholeGlobeRegion.populationNoStress += population;
          }

          // Shortage
          if (region.shortage <= thresholds.shortage[0]) {
            worldRegion.populationHighShortage += population;
            wholeGlobeRegion.populationHighShortage += population;
          } else if (region.shortage <= thresholds.shortage[1]) {
            worldRegion.populationModerateShortage += population;
            wholeGlobeRegion.populationModerateShortage += population;
          } else if (region.shortage <= thresholds.shortage[2]) {
            worldRegion.populationLowShortage += population;
            wholeGlobeRegion.populationLowShortage += population;
          } else {
            worldRegion.populationNoShortage += population;
            wholeGlobeRegion.populationNoShortage += population;
          }

          // Scarcity
          if (region.stress == null || region.stress >= thresholds.stress[0]) {
            if (region.shortage <= thresholds.shortage[2]) {
              worldRegion.populationShortageAndStress += population;
              wholeGlobeRegion.populationShortageAndStress += population;
            } else {
              worldRegion.populationOnlyStress += population;
              wholeGlobeRegion.populationOnlyStress += population;
            }
          } else if (region.shortage <= thresholds.shortage[2]) {
            worldRegion.populationOnlyShortage += population;
            wholeGlobeRegion.populationOnlyShortage += population;
          } else {
            worldRegion.populationNoShortageAndStress += population;
            wholeGlobeRegion.populationNoShortageAndStress += population;
          }
        });

      return result;
    });
  },
);

export function getSelectedHistoricalTimeIndex(state: StateTree): number {
  return state.selections.historicalTimeIndex;
}

export function getSelectedWaterRegionId(state: StateTree): number | undefined {
  return state.selections.region;
}

export function getSelectedWorldRegionId(state: StateTree): number {
  return state.selections.worldRegion;
}

export const getSelectedWorldRegion = createSelector<
  StateTree,
  number,
  WorldRegion[] | undefined,
  WorldRegion | undefined
>(
  getSelectedWorldRegionId,
  getWorldRegionData,
  (id, regions) => regions && regions.find(r => r.id === id),
);

export function getSelectedHistoricalDataType(state: StateTree) {
  return state.selections.historicalDataType;
}

export function getSelectedFutureDataType(state: StateTree) {
  return state.selections.futureDataType;
}

export function getSelectedImpactModel(state: StateTree) {
  return state.selections.impactModel;
}

export function getSelectedClimateModel(state: StateTree) {
  return state.selections.climateModel;
}

export function getSelectedFutureScenario(state: StateTree) {
  return state.selections.selectedFutureScenario;
}

export function getSelectedTimeScale(state: StateTree) {
  return state.selections.timeScale;
}

export const getTimeSeriesForSelectedWaterRegion = createSelector(
  getSelectedWaterRegionId,
  getStressShortageData,
  (selectedRegion, data) => {
    if (!data || selectedRegion === undefined) {
      return undefined;
    }

    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

export const getTimeSeriesForSelectedGlobalRegion = createSelector(
  getSelectedWorldRegionId,
  getAggregateData,
  (selectedRegion, data) => {
    return (
      data && data.map(timeAggregate => timeAggregate.data[selectedRegion])
    );
  },
);

export function getWaterRegionData(state: StateTree) {
  return state.data.waterRegions;
}

export function getWorldRegionData(state: StateTree) {
  return state.data.worldRegions;
}

export function getWaterToWorldRegionMap(state: StateTree) {
  return state.data.waterToWorldRegionsMap;
}

function getThresholds(state: StateTree) {
  return state.thresholds;
}

export function getThresholdsForDataType(
  state: StateTree,
  dataType: HistoricalDataType,
) {
  return getThresholds(state)[dataType];
}

// Note: this function removes zero and negative values from the
// stress and shortage data.
export const getDataByRegion = createSelector(
  getStressShortageData,
  getWorldRegionData,
  getWaterRegionData,
  (stressShortageData, worldRegions, waterRegions) => {
    if (!stressShortageData || !worldRegions || !waterRegions) {
      return undefined;
    }

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

    const regionObjects = waterRegions.features.map(feature => {
      const { featureId: regionId } = feature.properties;
      const stress: number[] = [];
      const shortage: number[] = [];
      const population: number[] = [];

      stressShortageData.forEach(d => {
        const regionData = d.data[regionId];
        // The log scales can't have numbers at or below 0
        stress.push(toPositiveNumber(regionData.stress));
        shortage.push(toPositiveNumber(regionData.shortage));
        population.push(regionData.population || 0);
      });

      return {
        id: String(regionId),
        data: {
          stress,
          shortage,
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
