import { Dispatch } from 'redux';
import {
  fetchHistoricalStressShortageData,
  fetchWaterRegionsData,
  fetchWorldRegionsData,
  generateWaterToWorldRegionsMap,
  WaterRegionGeoJSON,
} from './data';
import {
  AnyDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from './types';

export interface SetTimeIndexAction {
  type: 'SET_HISTORICAL_TIME_INDEX';
  value: number;
}
export function setTimeIndex(value: number): SetTimeIndexAction {
  return {
    type: 'SET_HISTORICAL_TIME_INDEX',
    value,
  };
}

export interface ToggleSelectedRegionAction {
  type: 'TOGGLE_SELECTED_REGION';
  id: number;
}
export function toggleSelectedRegion(id: number): ToggleSelectedRegionAction {
  return {
    type: 'TOGGLE_SELECTED_REGION',
    id,
  };
}

export interface SetSelectedRegionAction {
  type: 'SET_SELECTED_REGION';
  id?: number;
}
export function setSelectedRegion(id?: number): SetSelectedRegionAction {
  return {
    type: 'SET_SELECTED_REGION',
    id,
  };
}

export interface SetSelectedWorldRegionAction {
  type: 'SET_SELECTED_WORLD_REGION';
  id: number;
}
export function setSelectedWorldRegion(
  id: number,
): SetSelectedWorldRegionAction {
  return {
    type: 'SET_SELECTED_WORLD_REGION',
    id,
  };
}

export interface SetSelectedImpactModelAction {
  type: 'SET_SELECTED_IMPACT_MODEL';
  impactModel: string;
}
export function setSelectedImpactModel(
  impactModel: string,
): SetSelectedImpactModelAction {
  return {
    type: 'SET_SELECTED_IMPACT_MODEL',
    impactModel,
  };
}

export interface SetSelectedClimateModelAction {
  type: 'SET_SELECTED_CLIMATE_MODEL';
  climateModel: string;
}
export function setSelectedClimateModel(
  climateModel: string,
): SetSelectedClimateModelAction {
  return {
    type: 'SET_SELECTED_CLIMATE_MODEL',
    climateModel,
  };
}

export interface SetSelectedTimeScaleAction {
  type: 'SET_SELECTED_TIME_SCALE';
  timeScale: TimeScale;
}
export function setSelectedTimeScale(
  timeScale: TimeScale,
): SetSelectedTimeScaleAction {
  return {
    type: 'SET_SELECTED_TIME_SCALE',
    timeScale,
  };
}

export interface SetThresholdsForDataTypeAction {
  type: 'SET_THRESHOLDS_FOR_DATA_TYPE';
  dataType: AnyDataType;
  thresholds: number[];
}
export function setThresholdsForDataType(
  dataType: AnyDataType,
  thresholds: number[],
): SetThresholdsForDataTypeAction {
  return {
    type: 'SET_THRESHOLDS_FOR_DATA_TYPE',
    dataType,
    thresholds,
  };
}

export interface StoreWaterDataAction {
  type: 'STORE_WATER_DATA';
  data: Array<TimeAggregate<StressShortageDatum>>;
}
export function storeWaterData(
  data: Array<TimeAggregate<StressShortageDatum>>,
): StoreWaterDataAction {
  return {
    type: 'STORE_WATER_DATA',
    data,
  };
}

export interface StoreWaterRegionDataAction {
  type: 'STORE_WATER_REGION_DATA';
  data: WaterRegionGeoJSON;
}
export function storeWaterRegionData(
  data: WaterRegionGeoJSON,
): StoreWaterRegionDataAction {
  return {
    type: 'STORE_WATER_REGION_DATA',
    data,
  };
}

export interface StoreWorldRegionDataAction {
  type: 'STORE_WORLD_REGION_DATA';
  data: WorldRegion[];
}
export function storeWorldRegionData(
  data: WorldRegion[],
): StoreWorldRegionDataAction {
  return {
    type: 'STORE_WORLD_REGION_DATA',
    data,
  };
}

export interface StoreWaterToWorldRegionMapAction {
  type: 'STORE_WATER_TO_WORLD_REGION_MAP';
  map: { [waterRegionId: number]: number };
}
export function storeWaterToWorldRegionMap(map: {
  [waterRegionId: number]: number;
}): StoreWaterToWorldRegionMapAction {
  return {
    type: 'STORE_WATER_TO_WORLD_REGION_MAP',
    map,
  };
}

export interface ToggleHistoricalTimeIndexLockAction {
  type: 'TOGGLE_HISTORICAL_TIME_INDEX_LOCK';
}
export function toggleHistoricalTimeIndexLock(): ToggleHistoricalTimeIndexLockAction {
  return {
    type: 'TOGGLE_HISTORICAL_TIME_INDEX_LOCK',
  };
}

export function loadModelData(
  climateModel: string,
  impactModel: string,
  timeScale: string,
) {
  return (dispatch: Dispatch<Action>) => {
    return fetchHistoricalStressShortageData(
      climateModel,
      impactModel,
      timeScale,
    ).then(waterData => {
      if (waterData) {
        dispatch(storeWaterData(waterData));
      }
    });
  };
}

export function loadMapData() {
  return (dispatch: Dispatch<Action>) => {
    return Promise.all([fetchWaterRegionsData(), fetchWorldRegionsData()]).then(
      ([waterRegionData, worldRegionsData]) => {
        if (waterRegionData) {
          dispatch(storeWaterRegionData(waterRegionData));
          dispatch(
            storeWaterToWorldRegionMap(
              generateWaterToWorldRegionsMap(waterRegionData),
            ),
          );
        }

        if (worldRegionsData) {
          dispatch(storeWorldRegionData(worldRegionsData));
        }
      },
    );
  };
}

export type Action =
  | SetSelectedImpactModelAction
  | SetSelectedClimateModelAction
  | SetSelectedWorldRegionAction
  | SetSelectedRegionAction
  | SetSelectedTimeScaleAction
  | SetThresholdsForDataTypeAction
  | SetTimeIndexAction
  | StoreWaterDataAction
  | StoreWaterRegionDataAction
  | StoreWorldRegionDataAction
  | StoreWaterToWorldRegionMapAction
  | ToggleHistoricalTimeIndexLockAction
  | ToggleSelectedRegionAction;
