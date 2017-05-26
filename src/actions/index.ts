import { SET_TIME_INDEX, SetTimeIndexAction } from './types';

export function setTimeIndex(value: number): SetTimeIndexAction {
  return {
    type: SET_TIME_INDEX,
    value,
  };
}

export * from './types';
