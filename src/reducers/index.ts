import isEqual = require('lodash/isEqual');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_SELECTED_CLIMATE_MODEL,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_IMPACT_MODEL,
  SET_SELECTED_REGION,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_TIME_INDEX,
  STORE_WATER_DATA,
  STORE_WATER_REGION_DATA,
  STORE_WATER_TO_WORLD_REGION_MAP,
  STORE_WORLD_REGION_DATA,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import { defaultDataTypeThresholds } from '../data';
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
    impactModel: 'impactmodel1',
    climateModel: 'climatemodel1',
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
      // When we load the data, set the selected time index to the latest one
      // if we haven't changed the time index
      if (state.timeIndex === 0) {
        return {
          ...state,
          timeIndex: action.data.length - 1,
        };
      }

      return state;
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
        return {
          ...state,
          impactModel: action.impactModel,
        };
      }

      return state;
    case SET_SELECTED_CLIMATE_MODEL:
      if (action.climateModel !== state.climateModel) {
        return {
          ...state,
          climateModel: action.climateModel,
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
