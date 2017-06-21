import isEqual = require('lodash/isEqual');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_SELECTED_CLIMATE_MODEL,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_IMPACT_MODEL,
  SET_SELECTED_REGION,
  SET_SELECTED_TIME_SCALE,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_TIME_INDEX,
  STORE_WATER_DATA,
  STORE_WATER_REGION_DATA,
  STORE_WATER_TO_WORLD_REGION_MAP,
  STORE_WORLD_REGION_DATA,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import {
  defaultDataTypeThresholds,
  getClimateModels,
  getImpactModels,
} from '../data';
import { WaterRegionGeoJSON } from '../data/types';
import { StressShortageDatum, TimeAggregate, WorldRegion } from '../types';
import { StateTree } from './types';

const defaultState: StateTree = {
  routing: {} as any,
  data: {},
  thresholds: {
    stress: [...defaultDataTypeThresholds.stress],
    shortage: [...defaultDataTypeThresholds.shortage],
    scarcity: [...defaultDataTypeThresholds.scarcity],
  },
  selections: {
    timeIndex: 0,
    impactModel: 'watergap',
    climateModel: 'watch',
    timeScale: 'decadal',
    dataType: 'stress',
    worldRegion: 0, // 0 means global
  },
};

export const initialState = defaultState;

function dataReducer(
  state = initialState.data,
  action: Action,
): {
  stressShortageData?: Array<TimeAggregate<StressShortageDatum>>;
  worldRegions?: WorldRegion[];
  waterRegions?: WaterRegionGeoJSON;
  waterToWorldRegionsMap?: { [waterId: number]: number };
} {
  switch (action.type) {
    case STORE_WATER_DATA:
      return {
        ...state,
        stressShortageData: action.data,
      };
    case STORE_WATER_REGION_DATA:
      return {
        ...state,
        waterRegions: action.data,
      };
    case STORE_WORLD_REGION_DATA:
      return {
        ...state,
        worldRegions: action.data,
      };
    case STORE_WATER_TO_WORLD_REGION_MAP:
      return {
        ...state,
        waterToWorldRegionsMap: action.map,
      };
  }
  return state;
}

function thresholdsReducer(
  state = initialState.thresholds,
  action: Action,
): { stress: number[]; shortage: number[]; scarcity: number[] } {
  switch (action.type) {
    case SET_THRESHOLDS_FOR_DATA_TYPE:
      if (!isEqual(state[action.dataType], action.thresholds)) {
        return {
          ...state,
          [action.dataType]: action.thresholds,
        };
      }
  }
  return state;
}

function selectionsReducer(state = initialState.selections, action: Action) {
  switch (action.type) {
    case SET_TIME_INDEX:
      if (action.value !== state.timeIndex) {
        return {
          ...state,
          timeIndex: action.value,
        };
      }

      return state;
    case STORE_WATER_DATA:
      // When we load a new data set, set the selected time index to the latest
      // time period
      return {
        ...state,
        timeIndex: action.data.length - 1,
      };
    case TOGGLE_SELECTED_REGION:
      if (state.region === action.id) {
        return {
          ...state,
          region: undefined,
        };
      }

      return {
        ...state,
        region: action.id,
      };
    case SET_SELECTED_REGION:
      if (action.id !== state.region) {
        return {
          ...state,
          region: action.id,
        };
      }

      return state;
    case SET_SELECTED_WORLD_REGION:
      if (action.id !== state.worldRegion) {
        return {
          ...state,
          // Clear selected region
          region: undefined,
          worldRegion: action.id,
        };
      }

      return state;
    case SET_SELECTED_DATA_TYPE:
      if (action.dataType !== state.dataType) {
        return {
          ...state,
          dataType: action.dataType,
        };
      }

      return state;
    case SET_SELECTED_IMPACT_MODEL:
      if (action.impactModel !== state.impactModel) {
        let { climateModel, timeScale } = state;

        if (action.impactModel === 'watergap') {
          climateModel = 'watch';
          timeScale = 'decadal';
        } else {
          // If watergap/watch was previously selected, we need to switch to a
          // valid climateModel.
          if (climateModel === 'watch') {
            climateModel = getClimateModels().filter(m => m !== 'watch')[0];
          }
        }

        return {
          ...state,
          timeScale,
          climateModel,
          impactModel: action.impactModel,
        };
      }

      return state;
    case SET_SELECTED_CLIMATE_MODEL:
      if (action.climateModel !== state.climateModel) {
        let { impactModel, timeScale } = state;

        if (action.climateModel === 'watch') {
          impactModel = 'watergap';
          timeScale = 'decadal';
        } else {
          // If watergap/watch was previously selected, we need to switch to a
          // valid impactModel.
          if (impactModel === 'watergap') {
            impactModel = getImpactModels().filter(m => m !== 'watergap')[0];
          }
        }

        return {
          ...state,
          timeScale,
          impactModel,
          climateModel: action.climateModel,
        };
      }

      return state;
    case SET_SELECTED_TIME_SCALE:
      if (action.timeScale !== state.timeScale) {
        if (action.timeScale === 'annual' && state.impactModel === 'watergap') {
          // Watergap model only has decadal data
          return state;
        }

        return {
          ...state,
          timeScale: action.timeScale,
        };
      }

      return state;
  }

  return state;
}

export default combineReducers<StateTree>({
  routing: routerReducer,
  selections: selectionsReducer,
  thresholds: thresholdsReducer,
  data: dataReducer,
});

export * from './types';
