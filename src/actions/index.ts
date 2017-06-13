import { DataType } from '../types';
import {
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_REGION,
  SET_SELECTED_WORLD_REGION,
  SET_TIME_INDEX,
  SetSelectedDataTypeAction,
  SetSelectedRegionAction,
  SetSelectedWorldRegionAction,
  SetTimeIndexAction,
  TOGGLE_SELECTED_REGION,
  ToggleSelectedRegionAction,
} from './types';

export function setTimeIndex(value: number): SetTimeIndexAction {
  return {
    type: SET_TIME_INDEX,
    value,
  };
}

export function toggleSelectedRegion(id: number): ToggleSelectedRegionAction {
  return {
    type: TOGGLE_SELECTED_REGION,
    id,
  };
}

export function setSelectedRegion(id?: number): SetSelectedRegionAction {
  return {
    type: SET_SELECTED_REGION,
    id,
  };
}

export function setSelectedWorldRegion(
  id: number,
): SetSelectedWorldRegionAction {
  return {
    type: SET_SELECTED_WORLD_REGION,
    id,
  };
}

export function setSelectedDataType(
  dataType: DataType,
): SetSelectedDataTypeAction {
  return {
    type: SET_SELECTED_DATA_TYPE,
    dataType,
  };
}

export * from './types';
