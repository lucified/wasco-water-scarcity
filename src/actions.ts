import { Dispatch } from 'redux';
import {
  fetchFutureEnsembleData,
  fetchFutureScenarioData,
  fetchHistoricalStressShortageData,
  fetchWaterRegionsData,
  fetchWorldRegionsData,
  FutureDataset,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  generateWaterToWorldRegionsMap,
  WaterRegionGeoJSON,
} from './data';
import {
  FutureDataType,
  HistoricalDataType,
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

export interface SetSelectedHistoricalDataTypeAction {
  type: 'SET_SELECTED_HISTORICAL_DATA_TYPE';
  dataType: HistoricalDataType;
}
export function setSelectedHistoricalDataType(
  dataType: HistoricalDataType,
): SetSelectedHistoricalDataTypeAction {
  return {
    type: 'SET_SELECTED_HISTORICAL_DATA_TYPE',
    dataType,
  };
}

export interface SetSelectedFutureDataTypeAction {
  type: 'SET_SELECTED_FUTURE_DATA_TYPE';
  dataType: FutureDataType;
}
export function setSelectedFutureDataType(
  dataType: FutureDataType,
): SetSelectedFutureDataTypeAction {
  return {
    type: 'SET_SELECTED_FUTURE_DATA_TYPE',
    dataType,
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

export interface SetSelectedScenarioAction {
  type: 'SET_SELECTED_SCENARIO';
  selectedScenario: FutureScenario;
}
export function setSelectedScenario(
  selectedScenario: FutureScenario,
): SetSelectedScenarioAction {
  return {
    type: 'SET_SELECTED_SCENARIO',
    selectedScenario,
  };
}

export interface SetSelectedFutureFiltersAction {
  type: 'SET_SELECTED_FUTURE_FILTERS';
  climateModels: string[];
  climateExperiments: string[];
  impactModels: string[];
  populations: string[];
}
export function setSelectedFutureFilters(
  climateModels: string[],
  climateExperiments: string[],
  impactModels: string[],
  populations: string[],
): SetSelectedFutureFiltersAction {
  return {
    type: 'SET_SELECTED_FUTURE_FILTERS',
    climateModels,
    climateExperiments,
    impactModels,
    populations,
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
  dataType: HistoricalDataType;
  thresholds: number[];
}
export function setThresholdsForDataType(
  dataType: HistoricalDataType,
  thresholds: number[],
): SetThresholdsForDataTypeAction {
  return {
    type: 'SET_THRESHOLDS_FOR_DATA_TYPE',
    dataType,
    thresholds,
  };
}

export interface SetFutureTimeIndexAction {
  type: 'SET_FUTURE_TIME_INDEX';
  index: number;
}
export function setFutureTimeIndex(index: number): SetFutureTimeIndexAction {
  return {
    type: 'SET_FUTURE_TIME_INDEX',
    index,
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

export interface ToggleFutureScenarioLockAction {
  type: 'TOGGLE_FUTURE_SCENARIO_LOCK';
}
export function toggleFutureScenarioLock(): ToggleFutureScenarioLockAction {
  return {
    type: 'TOGGLE_FUTURE_SCENARIO_LOCK',
  };
}

export interface StoreFutureEnsembleDataAction {
  type: 'STORE_FUTURE_ENSEMBLE_DATA';
  variableName: string;
  data: FutureEnsembleData;
}
function storeFutureEnsembleData(
  variableName: string,
  data: FutureEnsembleData,
): StoreFutureEnsembleDataAction {
  return {
    type: 'STORE_FUTURE_ENSEMBLE_DATA',
    variableName,
    data,
  };
}

export interface StoreFutureScenarioDataAction {
  type: 'STORE_FUTURE_SCENARIO_DATA';
  scenario: FutureScenario;
  data: FutureScenarioData;
}
function storeFutureScenarioData(
  data: FutureScenarioData,
  scenario: FutureScenario,
): StoreFutureScenarioDataAction {
  return {
    type: 'STORE_FUTURE_SCENARIO_DATA',
    scenario,
    data,
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

export function loadFutureEnsembleData(
  dataset: FutureDataset,
  featureId: string,
) {
  return (dispatch: Dispatch<Action>) => {
    return fetchFutureEnsembleData(dataset, featureId).then(futureData => {
      if (futureData) {
        dispatch(
          // FIXME: will be overwritten on each fetch. Cache?
          storeFutureEnsembleData(dataset.variableName, futureData),
        );
      }
    });
  };
}

export function loadFutureScenarioData(
  dataset: FutureDataset,
  scenario: FutureScenario,
) {
  return (dispatch: Dispatch<Action>) => {
    return fetchFutureScenarioData(dataset, scenario).then(futureData => {
      if (futureData) {
        dispatch(
          // FIXME: Only cached on scenario level. Should be with dataset as well?
          storeFutureScenarioData(futureData, scenario),
        );
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
  | SetSelectedScenarioAction
  | SetSelectedFutureFiltersAction
  | SetSelectedHistoricalDataTypeAction
  | SetSelectedFutureDataTypeAction
  | SetSelectedWorldRegionAction
  | SetSelectedRegionAction
  | SetSelectedTimeScaleAction
  | SetThresholdsForDataTypeAction
  | SetTimeIndexAction
  | SetFutureTimeIndexAction
  | StoreFutureEnsembleDataAction
  | StoreFutureScenarioDataAction
  | StoreWaterDataAction
  | StoreWaterRegionDataAction
  | StoreWorldRegionDataAction
  | StoreWaterToWorldRegionMapAction
  | ToggleHistoricalTimeIndexLockAction
  | ToggleFutureScenarioLockAction
  | ToggleSelectedRegionAction;
