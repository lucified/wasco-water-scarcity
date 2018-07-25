import { isEqual } from 'lodash';
import { combineReducers } from 'redux';
import { Action } from '../actions';
import {
  defaultDataTypeThresholds,
  getDefaultHistoricalClimateModel,
  getDefaultHistoricalImpactModel,
  getHistoricalClimateModels,
} from '../data';
import { getGlobalStateFromURLHash } from '../url-state';
import { DataTree, SelectionsTree, StateTree, ThresholdsTree } from './types';

const defaultState: StateTree = {
  data: {},
  thresholds: {
    stress: [...defaultDataTypeThresholds.stress],
    shortage: [...defaultDataTypeThresholds.shortage],
    scarcity: [...defaultDataTypeThresholds.scarcity],
    kcal: [...defaultDataTypeThresholds.kcal],
  },
  selections: {
    historicalTimeIndex: 0,
    lockHistoricalTimeIndex: false,
    impactModel: getDefaultHistoricalImpactModel(),
    climateModel: getDefaultHistoricalClimateModel(),
    timeScale: 'decadal',
    worldRegion: 0, // 0 means global
    zoomedInToRegion: false,
    selectedGridVariable: 'pop',
  },
  requests: [],
};

export function getInitialState(): StateTree {
  const hashContents = getGlobalStateFromURLHash();
  return {
    ...defaultState,
    selections: {
      ...defaultState.selections,
      ...hashContents.selections,
    },
    thresholds: {
      ...defaultState.thresholds,
      ...hashContents.thresholds,
    },
  };
}

function dataReducer(state = defaultState.data, action: Action): DataTree {
  switch (action.type) {
    case 'STORE_WATER_DATA':
      return {
        ...state,
        stressShortageData: action.data,
      };
    case 'STORE_WATER_REGION_DATA':
      return {
        ...state,
        waterRegions: action.data,
      };
    case 'STORE_WORLD_REGION_DATA':
      return {
        ...state,
        worldRegions: action.data,
      };
    case 'STORE_WATER_TO_WORLD_REGION_MAP':
      return {
        ...state,
        waterToWorldRegionsMap: action.map,
      };
  }
  return state;
}

function requestsReducer(
  state = defaultState.requests,
  action: Action,
): string[] {
  switch (action.type) {
    case 'REQUEST_STARTED':
      return state.concat(action.id);
    case 'REQUEST_COMPLETED':
      if (state.indexOf(action.id) > -1) {
        return state.filter(id => id !== action.id);
      }
  }

  return state;
}

function thresholdsReducer(
  state = defaultState.thresholds,
  action: Action,
): ThresholdsTree {
  switch (action.type) {
    case 'SET_THRESHOLDS_FOR_DATA_TYPE':
      if (!isEqual(state[action.dataType], action.thresholds)) {
        return {
          ...state,
          [action.dataType]: action.thresholds,
        };
      }
  }
  return state;
}

function selectionsReducer(
  state = defaultState.selections,
  action: Action,
): SelectionsTree {
  switch (action.type) {
    case 'SET_HISTORICAL_TIME_INDEX':
      if (
        !state.lockHistoricalTimeIndex &&
        action.value !== state.historicalTimeIndex
      ) {
        return {
          ...state,
          historicalTimeIndex: action.value,
        };
      }

      return state;
    case 'STORE_WATER_DATA':
      // When we load a new data set, set the selected time index to the latest
      // time period if the selected time is larger than the available data
      if (state.historicalTimeIndex >= action.data.length) {
        return {
          ...state,
          historicalTimeIndex: action.data.length - 1,
        };
      }

      return state;
    case 'SET_REGION_ZOOM':
      if (state.zoomedInToRegion !== action.zoomedIn) {
        return {
          ...state,
          zoomedInToRegion: action.zoomedIn,
        };
      }

      return state;
    case 'SET_GRID_VARIABLE':
      if (state.selectedGridVariable !== action.variable) {
        return {
          ...state,
          selectedGridVariable: action.variable,
        };
      }

      return state;
    case 'TOGGLE_SELECTED_REGION':
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
    case 'SET_SELECTED_REGION':
      if (action.id !== state.region) {
        return {
          ...state,
          region: action.id,
        };
      }

      return state;
    case 'SET_SELECTED_WORLD_REGION':
      if (action.id !== state.worldRegion) {
        return {
          ...state,
          // Clear selected region
          region: undefined,
          worldRegion: action.id,
        };
      }

      return state;
    case 'SET_SELECTED_IMPACT_MODEL':
      if (action.impactModel !== state.impactModel) {
        let { climateModel } = state;

        // If watch was previously selected, we need to switch to a
        // valid climateModel.
        if (climateModel === 'watch') {
          climateModel = getHistoricalClimateModels().filter(
            m => m !== 'watch',
          )[0];
        }

        return {
          ...state,
          climateModel,
          impactModel: action.impactModel,
        };
      }

      return state;
    case 'SET_SELECTED_CLIMATE_MODEL':
      if (action.climateModel !== state.climateModel) {
        let { impactModel, timeScale } = state;

        if (action.climateModel === 'watch') {
          impactModel = 'watergap';
          timeScale = 'decadal';
        }

        return {
          ...state,
          timeScale,
          impactModel,
          climateModel: action.climateModel,
        };
      }

      return state;
    case 'SET_SELECTED_TIME_SCALE':
      if (action.timeScale !== state.timeScale) {
        if (action.timeScale === 'annual' && state.climateModel === 'watch') {
          // WATCH dataset only has decadal data
          return state;
        }

        return {
          ...state,
          timeScale: action.timeScale,
        };
      }

      return state;
    case 'TOGGLE_HISTORICAL_TIME_INDEX_LOCK':
      return {
        ...state,
        lockHistoricalTimeIndex: !state.lockHistoricalTimeIndex,
      };
  }

  return state;
}

export default combineReducers<StateTree>({
  selections: selectionsReducer,
  thresholds: thresholdsReducer,
  data: dataReducer,
  requests: requestsReducer,
});

export * from './types';
