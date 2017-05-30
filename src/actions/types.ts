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

export type Action = SetSelectedRegionAction | SetTimeIndexAction | ToggleSelectedRegionAction;
