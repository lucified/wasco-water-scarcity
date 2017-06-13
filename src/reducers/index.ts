import keyBy = require('lodash/keyBy');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_GLOBAL_REGION,
  SET_SELECTED_REGION,
  SET_TIME_INDEX,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import {
  getAggregateStressShortageData,
  getStressShortageData,
  getWorldRegionsData,
} from '../data';
import {
  AggregateStressShortageDatum,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';
import { StateTree } from './types';

const defaultState: StateTree = {
  routing: {} as any,
  stressShortageData: getStressShortageData(),
  aggregateData: getAggregateStressShortageData(),
  worldRegions: keyBy(getWorldRegionsData(), d => d.id),
  selections: {
    timeIndex: 0,
    dataType: 'stress',
    globalRegion: 0, // 0 means global
  },
};

export const initialState = defaultState;

function stressShortageDataReducer(
  state = initialState.stressShortageData,
  _action: Action,
): Array<TimeAggregate<StressShortageDatum>> {
  return state;
}

function aggregateDataReducer(
  state = initialState.aggregateData,
  _action: Action,
): Array<TimeAggregate<AggregateStressShortageDatum>> {
  return state;
}

function worldRegionsReducer(
  state = initialState.worldRegions,
  _action: Action,
): { [id: string]: WorldRegion } {
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
    case SET_SELECTED_GLOBAL_REGION:
      if (action.id !== state.globalRegion) {
        return {
          ...state,
          globalRegion: action.id,
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
  stressShortageData: stressShortageDataReducer,
  aggregateData: aggregateDataReducer,
  worldRegions: worldRegionsReducer,
});

export * from './types';
