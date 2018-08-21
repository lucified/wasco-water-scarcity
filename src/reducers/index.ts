import { isEqual } from 'lodash';
import { combineReducers } from 'redux';
import { Action } from '../actions';
import {
  defaultDataTypeThresholds,
  getDefaultHistoricalClimateModel,
  getDefaultHistoricalImpactModel,
  getHistoricalImpactModels,
} from '../data';
import { getGlobalStateFromURLHash } from '../url-state';
import { findClosestTimeRange } from '../utils';
import { DataTree, SelectionsTree, StateTree, ThresholdsTree } from './types';

const defaultState: StateTree = {
  data: {
    stressShortageData: {},
  },
  thresholds: {
    stress: [...defaultDataTypeThresholds.stress],
    shortage: [...defaultDataTypeThresholds.shortage],
    scarcity: [...defaultDataTypeThresholds.scarcity],
    kcal: [...defaultDataTypeThresholds.kcal],
  },
  selections: {
    historicalTimeStartYear: 1900,
    historicalTimeEndYear: 1900,
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
        stressShortageData: {
          ...state.stressShortageData,
          [action.scenarioId]: action.data,
        },
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
        (action.startYear !== state.historicalTimeStartYear ||
          action.endYear !== state.historicalTimeEndYear)
      ) {
        return {
          ...state,
          historicalTimeStartYear: action.startYear,
          historicalTimeEndYear: action.endYear,
        };
      }

      return state;
    case 'STORE_WATER_DATA':
      // When we load a new data set, set the selected time range to the closest
      // datum time range available
      const [startYear, endYear] = findClosestTimeRange(
        action.data.map<[number, number]>(d => [d.startYear, d.endYear]),
        state.historicalTimeStartYear,
        state.historicalTimeEndYear,
      );
      if (
        state.historicalTimeStartYear !== startYear ||
        state.historicalTimeEndYear !== endYear
      ) {
        return {
          ...state,
          historicalTimeStartYear: startYear,
          historicalTimeEndYear: endYear,
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
        return {
          ...state,
          impactModel: action.impactModel,
        };
      }

      return state;
    case 'SET_SELECTED_CLIMATE_MODEL':
      if (action.climateModel !== state.climateModel) {
        if (
          action.climateModel !== 'watch' &&
          state.impactModel === 'watergap-nat'
        ) {
          return {
            ...state,
            impactModel: getHistoricalImpactModels().filter(
              m => m !== 'watergap-nat',
            )[0],
            climateModel: action.climateModel,
          };
        }

        return {
          ...state,
          climateModel: action.climateModel,
        };
      }

      return state;
    case 'SET_SELECTED_TIME_SCALE':
      if (action.timeScale !== state.timeScale) {
        if (
          action.timeScale === 'annual' &&
          state.impactModel === 'watergap-nat'
        ) {
          return {
            ...state,
            impactModel: getHistoricalImpactModels().filter(
              m => m !== 'watergap-nat',
            )[0],
            timeScale: action.timeScale,
          };
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
