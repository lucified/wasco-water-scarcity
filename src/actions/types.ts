import { FutureData, SelectedScen, WaterRegionGeoJSON } from '../data';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export const SET_HISTORICAL_TIME_INDEX = 'SET_HISTORICAL_TIME_INDEX';
export interface SetTimeIndexAction {
  type: 'SET_HISTORICAL_TIME_INDEX';
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

export const SET_SELECTED_SCENARIO = 'SET_SELECTED_SCENARIO';
export interface SetSelectedScenarioAction {
  type: 'SET_SELECTED_SCENARIO';
  selectedScen: SelectedScen;
}

export const SET_SELECTED_FUTURE_FILTERS = 'SET_SELECTED_FUTURE_FILTERS';
export interface SetSelectedFutureFiltersAction {
  type: 'SET_SELECTED_FUTURE_FILTERS';
  climateModels: string[];
  climateExperiments: string[];
  impactModels: string[];
  populations: string[];
}

export const SET_SELECTED_TIME_SCALE = 'SET_SELECTED_TIME_SCALE';
export interface SetSelectedTimeScaleAction {
  type: 'SET_SELECTED_TIME_SCALE';
  timeScale: TimeScale;
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
  variableName: string;
  timeScale: TimeScale;
  data: FutureData;
}

export const TOGGLE_HISTORICAL_TIME_INDEX_LOCK =
  'TOGGLE_HISTORICAL_TIME_INDEX_LOCK';
export interface ToggleHistoricalTimeIndexLockAction {
  type: 'TOGGLE_HISTORICAL_TIME_INDEX_LOCK';
}

export const TOGGLE_FUTURE_SCENARIO_LOCK = 'TOGGLE_FUTURE_SCENARIO_LOCK';
export interface ToggleFutureScenarioLockAction {
  type: 'TOGGLE_FUTURE_SCENARIO_LOCK';
}

export type Action =
  | SetSelectedImpactModelAction
  | SetSelectedClimateModelAction
  | SetSelectedScenarioAction
  | SetSelectedFutureFiltersAction
  | SetSelectedDataTypeAction
  | SetSelectedWorldRegionAction
  | SetSelectedRegionAction
  | SetSelectedTimeScaleAction
  | SetThresholdsForDataTypeAction
  | SetTimeIndexAction
  | SetFutureTimeIndexAction
  | StoreFutureDataAction
  | StoreWaterDataAction
  | StoreWaterRegionDataAction
  | StoreWorldRegionDataAction
  | StoreWaterToWorldRegionMapAction
  | ToggleHistoricalTimeIndexLockAction
  | ToggleFutureScenarioLockAction
  | ToggleSelectedRegionAction;
