import isEqual = require('lodash/isEqual');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_FUTURE_TIME_INDEX,
  SET_SELECTED_CLIMATE_MODEL,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_FUTURE_SCENARIO,
  SET_SELECTED_IMPACT_MODEL,
  SET_SELECTED_REGION,
  SET_SELECTED_TIME_SCALE,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_TIME_INDEX,
  STORE_FUTURE_DATA,
  STORE_WATER_DATA,
  STORE_WATER_REGION_DATA,
  STORE_WATER_TO_WORLD_REGION_MAP,
  STORE_WORLD_REGION_DATA,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import {
  defaultDataTypeThresholds,
  getDefaultFutureDataset,
  getDefaultHistoricalClimateModel,
  getDefaultHistoricalImpactModel,
  getFutureDatasets,
} from '../data';
import { FutureData, WaterRegionGeoJSON } from '../data/types';
import {
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';
import { StateTree } from './types';

const defaultState: StateTree = {
  routing: {} as any,
  data: {
    futureData: {},
  },
  thresholds: {
    stress: [...defaultDataTypeThresholds.stress],
    shortage: [...defaultDataTypeThresholds.shortage],
    scarcity: [...defaultDataTypeThresholds.scarcity],
  },
  selections: {
    timeIndex: 0,
    futureTimeIndex: 0,
    futureDataset: getDefaultFutureDataset(),
    impactModel: getDefaultHistoricalImpactModel(),
    climateModel: getDefaultHistoricalClimateModel(),
    timeScale: 'decadal',
    dataType: 'stress',
    population: 'SSP1',
    climateExperiment: 'rcp8p5',
    worldRegion: 0, // 0 means global
  },
};

export const initialState = defaultState;

function getFutureDataset(
  dataType: 'stress' | 'shortage',
  timeScale: TimeScale,
) {
  const dataset = getFutureDatasets()
    .filter(d => d.timeScale === timeScale)
    .find(
      d =>
        dataType === 'shortage'
          ? d.variableName === 'short'
          : d.variableName === 'stress',
    );

  if (!dataset) {
    console.error('No future dataset found for dataType:', dataType);
  }

  return dataset;
}

function dataReducer(
  state = initialState.data,
  action: Action,
): {
  stressShortageData?: Array<TimeAggregate<StressShortageDatum>>;
  futureData: {
    [variableName: string]: { annual?: FutureData; decadal?: FutureData };
  };
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
    case STORE_FUTURE_DATA:
      const existingVariableData = state.futureData[action.variableName] || {};
      return {
        ...state,
        futureData: {
          ...state.futureData,
          [action.variableName]: {
            ...existingVariableData,
            [action.timeScale]: action.data,
          },
        },
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
        let { futureDataset } = state;
        if (action.dataType !== 'scarcity') {
          const dataset = getFutureDataset(action.dataType, state.timeScale);
          if (dataset) {
            futureDataset = dataset;
          }
        }

        return {
          ...state,
          futureDataset,
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
            climateModel = getDefaultHistoricalClimateModel();
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
            impactModel = getDefaultHistoricalImpactModel();
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

        let { futureDataset } = state;
        if (state.dataType !== 'scarcity') {
          const dataset = getFutureDataset(state.dataType, action.timeScale);
          if (dataset) {
            futureDataset = dataset;
          }
        }

        return {
          ...state,
          futureDataset,
          timeScale: action.timeScale,
        };
      }

      return state;
    case SET_SELECTED_FUTURE_SCENARIO:
      if (
        action.climateModel !== state.climateModel ||
        action.climateExperiment !== state.climateExperiment ||
        action.impactModel !== state.impactModel ||
        action.population !== state.population
      ) {
        return {
          ...state,
          climateModel: action.climateModel,
          climateExperiment: action.climateExperiment,
          impactModel: action.impactModel,
          population: action.population,
        };
      }

      return state;
    case SET_FUTURE_TIME_INDEX:
      if (action.index !== state.futureTimeIndex) {
        return {
          ...state,
          futureTimeIndex: action.index,
        };
      }

      return state;
  }

  return state;
}

export default combineReducers<StateTree>({
  routing: routerReducer as any,
  selections: selectionsReducer,
  thresholds: thresholdsReducer,
  data: dataReducer,
});

export * from './types';
