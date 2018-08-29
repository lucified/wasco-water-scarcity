import { keyBy } from 'lodash';
import { createSelector } from 'reselect';
import { Data as GapminderData } from './components/generic/gapminder';
import { toPastScenarioId } from './data';
import { StateTree } from './reducers';
import {
  AggregateStressShortageDatum,
  AnyDataType,
  TimeAggregate,
} from './types';
import { findClosestTimeRange } from './utils';

export function getStressShortageData(state: StateTree) {
  return state.data.stressShortageData;
}

export const getHistoricalScenarioId = createSelector(
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
  toPastScenarioId,
);

export const getStressShortageDataForScenario = createSelector(
  getStressShortageData,
  getHistoricalScenarioId,
  (data, scenarioId) => data && data[scenarioId],
);

/**
 * This returns the actual currently selected start and end years. It's set when
 * the user changes the selected time by e.g. hovering on a time selector or when
 * we load a new dataset. It is NOT set when we switch to a dataset that's already
 * been loaded.
 *
 * The time range might not be available in the data, which is why
 * getNearestHistoricalTimeRange should generally be used instead.
 */
const getSelectedHistoricalTimeRange = createSelector(
  (state: StateTree) => state.selections.historicalTimeStartYear,
  (state: StateTree) => state.selections.historicalTimeEndYear,
  (startYear, endYear) => [startYear, endYear],
);

/**
 * Returns the available time ranges of the current scenario data.
 */
export const getHistoricalDataTimeRanges = createSelector(
  getStressShortageDataForScenario,
  data => data && data.map<[number, number]>(d => [d.startYear, d.endYear]),
);

/**
 * This should be used in the UI to get the time range to display data for.
 */
export const getNearestHistoricalTimeRange = createSelector(
  getSelectedHistoricalTimeRange,
  getHistoricalDataTimeRanges,
  ([startYear, endYear], ranges) =>
    ranges && findClosestTimeRange(ranges, startYear, endYear),
);

/**
 * The index of the datum for the currently selected time range.
 */
export const getHistoricalDataTimeIndex = createSelector(
  getNearestHistoricalTimeRange,
  getHistoricalDataTimeRanges,
  (range, ranges) =>
    range &&
    ranges &&
    ranges.findIndex(d => d[0] === range[0] && d[1] === range[1]),
);

export const getSelectedStressShortageData = createSelector(
  getStressShortageDataForScenario,
  getNearestHistoricalTimeRange,
  (data, range) =>
    data &&
    range &&
    data.find(d => d.startYear === range[0] && d.endYear === range[1]),
);

export function isHistoricalTimeIndexLocked(state: StateTree) {
  return state.selections.lockHistoricalTimeIndex;
}

const getAggregateData = createSelector(
  getStressShortageDataForScenario,
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

      Object.keys(timeUnit.data).forEach(idString => {
        const id = Number(idString);
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

        const noStress =
          region.stress == null || region.stress < thresholds.stress[0];
        const mediumStress =
          region.stress != null &&
          region.stress >= thresholds.stress[1] &&
          region.stress < thresholds.stress[2];
        const highStress =
          region.stress != null && region.stress >= thresholds.stress[2];
        const noShortage =
          region.shortage == null || region.shortage > thresholds.shortage[2];
        const mediumShortage =
          region.shortage != null &&
          region.shortage <= thresholds.shortage[1] &&
          region.shortage < thresholds.shortage[2];
        const highShortage =
          region.shortage != null && region.shortage <= thresholds.shortage[0];

        // Stress
        if (noStress) {
          worldRegion.populationNoStress += population;
          wholeGlobeRegion.populationNoStress += population;
        } else if (highStress) {
          worldRegion.populationHighStress += population;
          wholeGlobeRegion.populationHighStress += population;
        } else if (mediumStress) {
          worldRegion.populationModerateStress += population;
          wholeGlobeRegion.populationModerateStress += population;
        } else {
          worldRegion.populationLowStress += population;
          wholeGlobeRegion.populationLowStress += population;
        }

        // Shortage
        if (noShortage) {
          worldRegion.populationNoShortage += population;
          wholeGlobeRegion.populationNoShortage += population;
        } else if (highShortage) {
          worldRegion.populationHighShortage += population;
          wholeGlobeRegion.populationHighShortage += population;
        } else if (mediumShortage) {
          worldRegion.populationModerateShortage += population;
          wholeGlobeRegion.populationModerateShortage += population;
        } else {
          worldRegion.populationLowShortage += population;
          wholeGlobeRegion.populationLowShortage += population;
        }

        // Scarcity
        if (!noStress) {
          if (!noShortage) {
            worldRegion.populationShortageAndStress += population;
            wholeGlobeRegion.populationShortageAndStress += population;
          } else {
            worldRegion.populationOnlyStress += population;
            wholeGlobeRegion.populationOnlyStress += population;
          }
        } else if (!noShortage) {
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

export function getRegionSearchTerms(state: StateTree) {
  return state.data.regionSearchTerms;
}

export function getSelectedWaterRegionId(state: StateTree) {
  return state.selections.region;
}

export function getSelectedWorldRegionId(state: StateTree) {
  return state.selections.worldRegion;
}

export const getSelectedWorldRegion = createSelector(
  getSelectedWorldRegionId,
  getWorldRegionData,
  (id, regions) => regions && regions.find(r => r.id === id),
);

export function getSelectedImpactModel(state: StateTree) {
  return state.selections.impactModel;
}

export function getSelectedClimateModel(state: StateTree) {
  return state.selections.climateModel;
}

export function getSelectedTimeScale(state: StateTree) {
  return state.selections.timeScale;
}

export function getSelectedGridVariable(state: StateTree) {
  return state.selections.selectedGridVariable;
}

export function isZoomedInToRegion(state: StateTree) {
  return state.selections.zoomedInToRegion;
}

function getRequestsTree(state: StateTree) {
  return state.requests;
}

export function isRequestOngoing(state: StateTree, requestId: string) {
  return getRequestsTree(state).indexOf(requestId) > -1;
}

export const getTimeSeriesForSelectedWaterRegion = createSelector(
  getSelectedWaterRegionId,
  getStressShortageDataForScenario,
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
  dataType: AnyDataType,
) {
  return getThresholds(state)[dataType];
}

export const getNameForWorldRegionId = createSelector(
  getWorldRegionData,
  worldRegions => {
    if (!worldRegions) {
      return (id: number) => (id === 0 ? 'Global' : '');
    }

    const hash = worldRegions.reduce<{ [id: number]: string }>(
      (result, region) => {
        result[region.id] = region.name;
        return result;
      },
      {},
    );
    return (id: number) => (id === 0 ? 'Global' : hash[id] || '');
  },
);

// Note: this function removes zero and negative values from the
// stress and shortage data.
export const getDataByRegion = createSelector(
  getStressShortageDataForScenario,
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
