import keyBy = require('lodash/keyBy');
import { createSelector } from 'reselect';

import { Data as GapminderData } from '../components/generic/gapminder';
import { StateTree } from '../reducers';
import { DataType, TimeAggregate } from '../types';

export function getWaterData(state: StateTree): TimeAggregate[] {
  return state.waterData;
}

export function getSelectedData(state: StateTree): TimeAggregate {
  return getWaterData(state)[getSelectedTimeIndex(state)];
}

export function getSelectedTimeIndex(state: StateTree): number {
  return state.selections.timeIndex;
}

export function getSelectedRegion(state: StateTree): number | undefined {
  return state.selections.region;
}

export function getSelectedDataType(state: StateTree): DataType {
  return state.selections.dataType;
}

export const getTimeSeriesForSelectedRegion = createSelector(
  getSelectedRegion,
  getWaterData,
  (selectedRegion, data) => {
    if (selectedRegion === undefined) {
      return undefined;
    }

    return data.map(timeAggregate => timeAggregate.data[selectedRegion]);
  },
);

// prettier-ignore
export const getDataByRegion = createSelector<
  StateTree,
  TimeAggregate[],
  GapminderData
>(
  getWaterData,
  waterData => {
    const timeRanges = waterData.map(
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
    const regionObjects = Object.keys(waterData[0].data).map(id => {
      const regionId = Number(id);
      const blueWaterStress: number[] = [];
      const blueWaterShortage: number[] = [];
      const population: number[] = [];

      waterData.forEach(d => {
        const regionData = d.data[regionId];
        // The log scales can't have numbers at or below 0
        blueWaterStress.push(toPositiveNumber(regionData.blueWaterStress));
        blueWaterShortage.push(toPositiveNumber(regionData.blueWaterShortage));
        population.push(regionData.population || 0);
      });

      return {
        id,
        color: 'blue', // TODO once we have region info
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
