import keyBy = require('lodash/keyBy');
import { createSelector } from 'reselect';

import { Data as GapminderData } from '../components/generic/gapminder';
import { StateTree } from '../reducers';
import {
  AggregateStressShortageDatum,
  DataType,
  StressShortageDatum,
  TimeAggregate,
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

export function getAggregateData(
  state: StateTree,
): Array<TimeAggregate<AggregateStressShortageDatum>> {
  return state.aggregateData;
}

export function getSelectedTimeIndex(state: StateTree): number {
  return state.selections.timeIndex;
}

export function getSelectedRegion(state: StateTree): number | undefined {
  return state.selections.region;
}

export function getSelectedGlobalRegion(state: StateTree): number {
  return state.selections.globalRegion;
}

export function getSelectedDataType(state: StateTree): DataType {
  return state.selections.dataType;
}

export const getTimeSeriesForSelectedRegion = createSelector(
  getSelectedRegion,
  getStressShortageData,
  (selectedRegion, data) => {
    if (selectedRegion === undefined) {
      return undefined;
    }

    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

export const getTimeSeriesForSelectedGlobalRegion = createSelector(
  getSelectedGlobalRegion,
  getAggregateData,
  (selectedRegion, data) => {
    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

// Note: this function removes zero and negative values from the
// stress and shortage data.
// prettier-ignore
export const getDataByRegion = createSelector<
  StateTree,
  Array<TimeAggregate<StressShortageDatum>>,
  GapminderData
>(
  getStressShortageData,
  stressShortageData => {
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
        color: 'lightblue', // TODO once we have region info
        data: {
          blueWaterStress,
          blueWaterShortage,
          population,
        },
      };
    });

    return {
      timeRanges,
      regions: keyBy(regionObjects, d => d.id),
    };
  },
);
