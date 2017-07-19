import isEqual = require('lodash/isEqual');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  TOGGLE_FUTURE_SCENARIO_LOCK,
  SET_FUTURE_TIME_INDEX,
  TOGGLE_HISTORICAL_TIME_INDEX_LOCK,
  SET_SELECTED_CLIMATE_MODEL,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_FUTURE_FILTERS,
  SET_SELECTED_IMPACT_MODEL,
  SET_SELECTED_REGION,
  SET_SELECTED_SCENARIO,
  SET_SELECTED_TIME_SCALE,
  SET_SELECTED_WORLD_REGION,
  SET_THRESHOLDS_FOR_DATA_TYPE,
  SET_HISTORICAL_TIME_INDEX,
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
  getFutureDataset,
  getHistoricalClimateModels,
  getHistoricalImpactModels,
} from '../data';
import { TimeScale } from '../types';
import { DataTree, SelectionsTree, StateTree, ThresholdsTree } from './types';

const defaultFutureDataset = getDefaultFutureDataset();

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
    historicalTimeIndex: 0,
    lockHistoricalTimeIndex: false,
    futureTimeIndex: 0,
    futureDataset: defaultFutureDataset,
    futureFilters: {
      climateModels: defaultFutureDataset.climateModels,
      climateExperiments: defaultFutureDataset.climateExperiments,
      impactModels: defaultFutureDataset.impactModels,
      populations: defaultFutureDataset.populations,
    },
    impactModel: getDefaultHistoricalImpactModel(),
    climateModel: getDefaultHistoricalClimateModel(),
    timeScale: 'decadal',
    dataType: 'stress',
    population: 'SSP1',
    climateExperiment: 'rcp8p5',
    lockFutureScenario: false,
    worldRegion: 0, // 0 means global
  },
};

export const initialState = defaultState;

function dataReducer(state = initialState.data, action: Action): DataTree {
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
): ThresholdsTree {
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

function getDatasetAndFilters(
  dataType: 'stress' | 'shortage',
  timeScale: TimeScale,
  existingFilters: {
    impactModels: string[];
    climateModels: string[];
    climateExperiments: string[];
    populations: string[];
  },
) {
  const dataset = getFutureDataset(dataType, timeScale);
  let filters = existingFilters;
  if (dataset) {
    // If the existing filters contain a value that's not in the new dataset,
    // reset the filters to the new dataset's values.
    if (
      existingFilters.climateExperiments.some(
        f => !dataset.climateExperiments.find(d => d === f),
      ) ||
      existingFilters.climateModels.some(
        f => !dataset.climateModels.find(d => d === f),
      ) ||
      existingFilters.impactModels.some(
        f => !dataset.impactModels.find(d => d === f),
      ) ||
      existingFilters.populations.some(
        f => !dataset.populations.find(d => d === f),
      )
    ) {
      filters = {
        climateExperiments: dataset.climateExperiments,
        climateModels: dataset.climateModels,
        impactModels: dataset.impactModels,
        populations: dataset.populations,
      };
    }
  }

  return { dataset, filters };
}

function selectionsReducer(
  state = initialState.selections,
  action: Action,
): SelectionsTree {
  switch (action.type) {
    case SET_HISTORICAL_TIME_INDEX:
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
    case STORE_WATER_DATA:
      // When we load a new data set, set the selected time index to the latest
      // time period
      return {
        ...state,
        historicalTimeIndex: action.data.length - 1,
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
        let { futureDataset, futureFilters } = state;
        if (action.dataType !== 'scarcity') {
          const { dataset, filters } = getDatasetAndFilters(
            action.dataType,
            state.timeScale,
            futureFilters,
          );
          if (dataset) {
            futureDataset = dataset;
            futureFilters = filters;
          }
        }

        return {
          ...state,
          futureFilters,
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
            climateModel = getHistoricalClimateModels().filter(
              m => m !== 'watch',
            )[0];
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
            impactModel = getHistoricalImpactModels().filter(
              m => m !== 'watergap',
            )[0];
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

        let { futureDataset, futureFilters } = state;
        if (state.dataType !== 'scarcity') {
          const { dataset, filters } = getDatasetAndFilters(
            state.dataType,
            action.timeScale,
            futureFilters,
          );
          if (dataset) {
            futureDataset = dataset;
            futureFilters = filters;
          }
        }

        return {
          ...state,
          futureFilters,
          futureDataset,
          timeScale: action.timeScale,
        };
      }

      return state;
    case SET_SELECTED_SCENARIO:
      if (
        !state.lockFutureScenario &&
        (action.climateModel !== state.climateModel ||
          action.climateExperiment !== state.climateExperiment ||
          action.impactModel !== state.impactModel ||
          action.population !== state.population)
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
    case SET_SELECTED_FUTURE_FILTERS:
      if (
        !isEqual(action.climateModels, state.futureFilters.climateModels) ||
        !isEqual(
          action.climateExperiments,
          state.futureFilters.climateExperiments,
        ) ||
        !isEqual(action.impactModels, state.futureFilters.impactModels) ||
        !isEqual(action.populations, state.futureFilters.populations)
      ) {
        return {
          ...state,
          futureFilters: {
            climateModels: action.climateModels,
            impactModels: action.impactModels,
            climateExperiments: action.climateExperiments,
            populations: action.populations,
          },
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
    case TOGGLE_HISTORICAL_TIME_INDEX_LOCK:
      return {
        ...state,
        lockHistoricalTimeIndex: !state.lockHistoricalTimeIndex,
      };
    case TOGGLE_FUTURE_SCENARIO_LOCK:
      return {
        ...state,
        lockFutureScenario: !state.lockFutureScenario,
      };
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
