import { Dispatch } from 'redux';

import {
  fetchFutureData,
  fetchHistoricalStressShortageData,
  fetchWaterRegionsData,
  fetchWorldRegionsData,
  FutureData,
  FutureDataset,
  FutureScenario,
  generateWaterToWorldRegionsMap,
  getFutureEnsembleURL,
  WaterRegionGeoJSON,
} from '../data';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';
import {
  SET_FUTURE_TIME_INDEX,
  SET_HISTORICAL_TIME_INDEX,
  SET_SELECTED_CLIMATE_MODEL,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_FUTURE_FILTERS,
  SET_SELECTED_IMPACT_MODEL,
  SET_SELECTED_REGION,
  SET_SELECTED_SCENARIO,
  SET_SELECTED_TIME_SCALE,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SetFutureTimeIndexAction,
  SetSelectedClimateModelAction,
  SetSelectedDataTypeAction,
  SetSelectedFutureFiltersAction,
  SetSelectedImpactModelAction,
  SetSelectedRegionAction,
  SetSelectedScenarioAction,
  SetSelectedTimeScaleAction,
  SetSelectedWorldRegionAction,
  SetThresholdsForDataTypeAction,
  SetTimeIndexAction,
  STORE_FUTURE_DATA,
  STORE_WATER_DATA,
  STORE_WATER_REGION_DATA,
  STORE_WATER_TO_WORLD_REGION_MAP,
  STORE_WORLD_REGION_DATA,
  StoreFutureDataAction,
  StoreWaterDataAction,
  StoreWaterRegionDataAction,
  StoreWaterToWorldRegionMapAction,
  StoreWorldRegionDataAction,
  TOGGLE_FUTURE_SCENARIO_LOCK,
  TOGGLE_HISTORICAL_TIME_INDEX_LOCK,
  TOGGLE_SELECTED_REGION,
  ToggleFutureScenarioLockAction,
  ToggleHistoricalTimeIndexLockAction,
  ToggleSelectedRegionAction,
} from './types';

export function setTimeIndex(value: number): SetTimeIndexAction {
  return {
    type: SET_HISTORICAL_TIME_INDEX,
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

export function setSelectedImpactModel(
  impactModel: string,
): SetSelectedImpactModelAction {
  return {
    type: SET_SELECTED_IMPACT_MODEL,
    impactModel,
  };
}

export function setSelectedClimateModel(
  climateModel: string,
): SetSelectedClimateModelAction {
  return {
    type: SET_SELECTED_CLIMATE_MODEL,
    climateModel,
  };
}

export function setSelectedScenario(
  selectedScenario: FutureScenario,
): SetSelectedScenarioAction {
  return {
    type: SET_SELECTED_SCENARIO,
    selectedScenario,
  };
}

export function setSelectedFutureFilters(
  climateModels: string[],
  climateExperiments: string[],
  impactModels: string[],
  populations: string[],
): SetSelectedFutureFiltersAction {
  return {
    type: SET_SELECTED_FUTURE_FILTERS,
    climateModels,
    climateExperiments,
    impactModels,
    populations,
  };
}

export function setSelectedTimeScale(
  timeScale: TimeScale,
): SetSelectedTimeScaleAction {
  return {
    type: SET_SELECTED_TIME_SCALE,
    timeScale,
  };
}

export function setThresholdsForDataType(
  dataType: DataType,
  thresholds: number[],
): SetThresholdsForDataTypeAction {
  return {
    type: SET_THRESHOLDS_FOR_DATA_TYPE,
    dataType,
    thresholds,
  };
}

export function setFutureTimeIndex(index: number): SetFutureTimeIndexAction {
  return {
    type: SET_FUTURE_TIME_INDEX,
    index,
  };
}

export function storeWaterData(
  data: Array<TimeAggregate<StressShortageDatum>>,
): StoreWaterDataAction {
  return {
    type: STORE_WATER_DATA,
    data,
  };
}

export function storeWaterRegionData(
  data: WaterRegionGeoJSON,
): StoreWaterRegionDataAction {
  return {
    type: STORE_WATER_REGION_DATA,
    data,
  };
}

export function storeWorldRegionData(
  data: WorldRegion[],
): StoreWorldRegionDataAction {
  return {
    type: STORE_WORLD_REGION_DATA,
    data,
  };
}

export function storeWaterToWorldRegionMap(map: {
  [waterRegionId: number]: number;
}): StoreWaterToWorldRegionMapAction {
  return {
    type: STORE_WATER_TO_WORLD_REGION_MAP,
    map,
  };
}

export function toggleHistoricalTimeIndexLock(): ToggleHistoricalTimeIndexLockAction {
  return {
    type: TOGGLE_HISTORICAL_TIME_INDEX_LOCK,
  };
}

export function toggleFutureScenarioLock(): ToggleFutureScenarioLockAction {
  return {
    type: TOGGLE_FUTURE_SCENARIO_LOCK,
  };
}

function storeFutureData(
  variableName: string,
  timeScale: TimeScale,
  data: FutureData,
): StoreFutureDataAction {
  return {
    type: STORE_FUTURE_DATA,
    variableName,
    timeScale,
    data,
  };
}

export function loadModelData(
  climateModel: string,
  impactModel: string,
  timeScale: string,
) {
  return (dispatch: Dispatch<any>) => {
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

export function loadFutureData(dataset: FutureDataset, featureId: string) {
  return (dispatch: Dispatch<any>) => {
    const url = getFutureEnsembleURL(dataset, featureId);
    return fetchFutureData(url).then(futureData => {
      if (futureData) {
        dispatch(
          // TODO: will be overwritten by new featureId, but we don't want to store them anyway
          storeFutureData(dataset.variableName, dataset.timeScale, futureData),
        );
      }
    });
  };
}

export function loadMapData() {
  return (dispatch: Dispatch<any>) => {
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

export * from './types';
