import { Dispatch } from 'redux';

import {
  fetchStressShortageData,
  fetchWaterRegionsData,
  fetchWorldRegionsData,
  generateWaterToWorldRegionsMap,
} from '../data';
import { WaterRegionGeoJSON } from '../data/types';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';
import {
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_REGION,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_TIME_INDEX,
  SetSelectedDataTypeAction,
  SetSelectedRegionAction,
  SetSelectedWorldRegionAction,
  SetThresholdsForDataTypeAction,
  SetTimeIndexAction,
  STORE_WATER_DATA,
  STORE_WATER_REGION_DATA,
  STORE_WATER_TO_WORLD_REGION_MAP,
  STORE_WORLD_REGION_DATA,
  StoreWaterDataAction,
  StoreWaterRegionDataAction,
  StoreWaterToWorldRegionMapAction,
  StoreWorldRegionDataAction,
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

export function loadAppData() {
  return (dispatch: Dispatch<any>) => {
    return Promise.all([
      fetchStressShortageData(
        require('!!file-loader!../../data/FPU_decadal_bluewater.json'),
      ),
      fetchWaterRegionsData(require('!!file-loader!../../data/FPU.json')),
      fetchWorldRegionsData(
        require('!!file-loader!../../data/worldRegion.json'),
      ),
    ]).then(([waterData, waterRegionData, worldRegionsData]) => {
      if (waterData) {
        dispatch(storeWaterData(waterData));
      }

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
    });
  };
}

export * from './types';
