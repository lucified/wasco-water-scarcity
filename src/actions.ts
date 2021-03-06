import { Dispatch } from 'redux';
import {
  fetchHistoricalStressShortageData,
  fetchWaterRegionsTopojson,
  generateWaterToWorldRegionsMap,
  GridVariable,
  WaterRegionGeoJSON,
} from './data';
import {
  AnyDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from './types';

export interface SetTimeAction {
  type: 'SET_HISTORICAL_TIME';
  startYear: number;
  endYear: number;
}
export function setTimeRange(
  startYear: number,
  endYear: number,
): SetTimeAction {
  return {
    type: 'SET_HISTORICAL_TIME',
    startYear,
    endYear,
  };
}

export interface SetRegionZoomAction {
  type: 'SET_REGION_ZOOM';
  zoomedIn: boolean;
}
export function setRegionZoom(zoomedIn: boolean): SetRegionZoomAction {
  return {
    type: 'SET_REGION_ZOOM',
    zoomedIn,
  };
}

export interface SetGridVariableAction {
  type: 'SET_GRID_VARIABLE';
  variable: GridVariable;
}
export function setSelectedGridVariable(
  variable: GridVariable,
): SetGridVariableAction {
  return {
    type: 'SET_GRID_VARIABLE',
    variable,
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
  scenarioId: string;
  data: Array<TimeAggregate<StressShortageDatum>>;
}
export function storeWaterData(
  scenarioId: string,
  data: Array<TimeAggregate<StressShortageDatum>>,
): StoreWaterDataAction {
  return {
    type: 'STORE_WATER_DATA',
    scenarioId,
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

export interface RequestStartedAction {
  type: 'REQUEST_STARTED';
  id: string;
}
export function requestStarted(id: string): RequestStartedAction {
  return {
    type: 'REQUEST_STARTED',
    id,
  };
}

export interface RequestCompletedAction {
  type: 'REQUEST_COMPLETED';
  id: string;
}
export function requestCompleted(id: string): RequestCompletedAction {
  return {
    type: 'REQUEST_COMPLETED',
    id,
  };
}

export function loadModelData(
  climateModel: string,
  impactModel: string,
  timeScale: TimeScale,
  scenarioId: string,
) {
  return async (dispatch: Dispatch<Action>) => {
    dispatch(requestStarted(scenarioId));
    const waterData = await fetchHistoricalStressShortageData(
      climateModel,
      impactModel,
      timeScale,
    );
    if (waterData) {
      dispatch(storeWaterData(scenarioId, waterData));
    }
    dispatch(requestCompleted(scenarioId));
  };
}

export function loadMapData() {
  return async (dispatch: Dispatch<Action>) => {
    const requestId = 'mapdata';
    dispatch(requestStarted(requestId));
    const results = await fetchWaterRegionsTopojson();
    if (results) {
      const [waterRegionData, worldRegionsData] = results;
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
    }
    dispatch(requestCompleted(requestId));
  };
}

export type Action =
  | SetSelectedImpactModelAction
  | SetSelectedClimateModelAction
  | SetSelectedWorldRegionAction
  | SetSelectedRegionAction
  | SetSelectedTimeScaleAction
  | SetThresholdsForDataTypeAction
  | SetTimeAction
  | SetGridVariableAction
  | SetRegionZoomAction
  | StoreWaterDataAction
  | StoreWaterRegionDataAction
  | StoreWorldRegionDataAction
  | StoreWaterToWorldRegionMapAction
  | RequestStartedAction
  | RequestCompletedAction
  | ToggleHistoricalTimeIndexLockAction
  | ToggleSelectedRegionAction;
