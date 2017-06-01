import { createSelector } from 'reselect';

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
