import { WaterRegionGeoJSON } from '../data/types';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';

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

export const SET_SELECTED_WORLD_REGION = 'SET_SELECTED_WORLD_REGION';
export interface SetSelectedWorldRegionAction {
  type: 'SET_SELECTED_WORLD_REGION';
  id: number;
}

export const SET_SELECTED_DATA_TYPE = 'SET_SELECTED_DATA_TYPE';
export interface SetSelectedDataTypeAction {
  type: 'SET_SELECTED_DATA_TYPE';
  dataType: DataType;
}

export const SET_SELECTED_IMPACT_MODEL = 'SET_SELECTED_IMPACT_MODEL';
export interface SetSelectedImpactModelAction {
  type: 'SET_SELECTED_IMPACT_MODEL';
  impactModel: string;
}

export const SET_SELECTED_CLIMATE_MODEL = 'SET_SELECTED_CLIMATE_MODEL';
export interface SetSelectedClimateModelAction {
  type: 'SET_SELECTED_CLIMATE_MODEL';
  climateModel: string;
}

export const SET_SELECTED_TIME_SCALE = 'SET_SELECTED_TIME_SCALE';
export interface SetSelectedTimeScaleAction {
  type: 'SET_SELECTED_TIME_SCALE';
  timeScale: string;
}

export const SET_THRESHOLDS_FOR_DATA_TYPE = 'SET_THRESHOLDS_FOR_DATA_TYPE';
export interface SetThresholdsForDataTypeAction {
  type: 'SET_THRESHOLDS_FOR_DATA_TYPE';
  dataType: DataType;
  thresholds: number[];
}

export const SET_FUTURE_TIME_INDEX = 'SET_FUTURE_TIME_INDEX';
export interface SetFutureTimeIndexAction {
  type: 'SET_FUTURE_TIME_INDEX';
  index: number;
}

export const SET_FUTURE_MODEL = 'SET_FUTURE_MODEL';
export interface SetFutureModelAction {
  type: 'SET_FUTURE_MODEL';
  id: string;
}

export const STORE_WATER_DATA = 'STORE_WATER_DATA';
export interface StoreWaterDataAction {
  type: 'STORE_WATER_DATA';
  data: Array<TimeAggregate<StressShortageDatum>>;
}

export const STORE_WATER_REGION_DATA = 'STORE_WATER_REGION_DATA';
export interface StoreWaterRegionDataAction {
  type: 'STORE_WATER_REGION_DATA';
  data: WaterRegionGeoJSON;
}

export const STORE_WORLD_REGION_DATA = 'STORE_WORLD_REGION_DATA';
export interface StoreWorldRegionDataAction {
  type: 'STORE_WORLD_REGION_DATA';
  data: WorldRegion[];
}

export const STORE_WATER_TO_WORLD_REGION_MAP =
  'STORE_WATER_TO_WORLD_REGION_MAP';
export interface StoreWaterToWorldRegionMapAction {
  type: 'STORE_WATER_TO_WORLD_REGION_MAP';
  map: { [waterRegionId: number]: number };
}

export const STORE_FUTURE_DATA = 'STORE_FUTURE_DATA';
export interface StoreFutureDataAction {
  type: 'STORE_FUTURE_DATA';
  data: Array<{ id: string; data: Array<TimeAggregate<StressShortageDatum>> }>;
}

export type Action =
  | SetSelectedImpactModelAction
  | SetSelectedClimateModelAction
  | SetSelectedDataTypeAction
  | SetSelectedWorldRegionAction
  | SetSelectedRegionAction
  | SetSelectedTimeScaleAction
  | SetThresholdsForDataTypeAction
  | SetTimeIndexAction
  | SetFutureModelAction
  | SetFutureTimeIndexAction
  | StoreFutureDataAction
  | StoreWaterDataAction
  | StoreWaterRegionDataAction
  | StoreWorldRegionDataAction
  | StoreWaterToWorldRegionMapAction
  | ToggleSelectedRegionAction;
