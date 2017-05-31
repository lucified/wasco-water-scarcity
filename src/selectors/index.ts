import { StateTree } from '../reducers';
import { TimeAggregate } from '../types';

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
