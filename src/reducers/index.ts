import isEqual = require('lodash/isEqual');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_REGION,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_TIME_INDEX,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import {
  defaultDataTypeThresholds,
  generateWaterToWorldRegionsMap,
  getStressShortageData,
  getWaterRegionsData,
  getWorldRegionsData,
} from '../data';
import { WaterRegionGeoJSON } from '../data/types';
import { StressShortageDatum, TimeAggregate, WorldRegion } from '../types';
import { StateTree } from './types';

const waterRegions: WaterRegionGeoJSON = getWaterRegionsData();

const defaultState: StateTree = {
  routing: {} as any,
  stressShortageData: getStressShortageData(),
  worldRegions: getWorldRegionsData(),
  waterRegions,
  waterToWorldRegionsMap: generateWaterToWorldRegionsMap(waterRegions),
  thresholds: {
    stress: [...defaultDataTypeThresholds.stress],
    shortage: [...defaultDataTypeThresholds.shortage],
    scarcity: [...defaultDataTypeThresholds.scarcity],
  },
  selections: {
    timeIndex: 0,
    dataType: 'stress',
    worldRegion: 0, // 0 means global
  },
};

export const initialState = defaultState;

function stressShortageDataReducer(
  state = initialState.stressShortageData,
  _action: Action,
): Array<TimeAggregate<StressShortageDatum>> {
  return state;
}

function waterRegionsReducer(
  state = initialState.waterRegions,
  _action: Action,
): WaterRegionGeoJSON {
  return state;
}

function waterToWorldRegionsMapReducer(
  state = initialState.waterToWorldRegionsMap,
  _action: Action,
): { [waterRegionId: number]: number } {
  return state;
}

function worldRegionsReducer(
  state = initialState.worldRegions,
  _action: Action,
): WorldRegion[] {
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
  }

  return state;
}

export default combineReducers<StateTree>({
  routing: routerReducer,
  selections: selectionsReducer,
  thresholds: thresholdsReducer,
  stressShortageData: stressShortageDataReducer,
  worldRegions: worldRegionsReducer,
  waterRegions: waterRegionsReducer,
  waterToWorldRegionsMap: waterToWorldRegionsMapReducer,
});

export * from './types';
