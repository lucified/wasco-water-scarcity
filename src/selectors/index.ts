import { StateTree, TimeAggregate } from '../reducers';

export function getWaterData(state: StateTree): TimeAggregate[] {
  return state.waterData;
}

export function getSelectedData(state: StateTree): TimeAggregate {
  return getWaterData(state)[getSelectedTimeIndex(state)];
}

export function getSelectedTimeIndex(state: StateTree): number {
  return state.selectedTimeIndex;
}
