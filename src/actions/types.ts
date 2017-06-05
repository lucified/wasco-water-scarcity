import { DataType } from '../types';

export const SET_TIME_INDEX = 'SET_TIME_INDEX';
export interface SetTimeIndexAction {
  type: 'SET_TIME_INDEX';
  value: number;
}

export const TOGGLE_SELECTED_REGION = 'TOGGLE_SELECTED_REGION';
export interface ToggleSelectedRegionAction {
  type: 'TOGGLE_SELECTED_REGION';
  id: number;
}

export const SET_SELECTED_REGION = 'SET_SELECTED_REGION';
export interface SetSelectedRegionAction {
  type: 'SET_SELECTED_REGION';
  id?: number;
}

export const SET_SELECTED_DATA_TYPE = 'SET_SELECTED_DATA_TYPE';
export interface SetSelectedDataTypeAction {
  type: 'SET_SELECTED_DATA_TYPE';
  dataType: DataType;
}

export type Action =
  | SetSelectedDataTypeAction
  | SetSelectedRegionAction
  | SetTimeIndexAction
  | ToggleSelectedRegionAction;
