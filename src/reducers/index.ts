import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import {
  Action,
  SET_SELECTED_DATA_TYPE,
  SET_SELECTED_REGION,
  SET_TIME_INDEX,
  TOGGLE_SELECTED_REGION,
} from '../actions';
import { RawWaterDatum, TimeAggregate, toWaterDatum } from '../types';
import { StateTree } from './types';

let rawWaterData: RawWaterDatum[] | null = require('../../data/FPU_decadal_bluewater.json');
let yearlyGroupedData: RawWaterDatum[][] | null =
  values(groupBy(rawWaterData!, ({ startYear }) => startYear))
    .sort((a, b) => a[0].startYear - b[0].startYear);

const defaultState: StateTree = {
  routing: {} as any,
  waterData: yearlyGroupedData.map(group => ({
    startYear: group[0].startYear,
    endYear: group[0].endYear,
    data: keyBy(group.map(toWaterDatum), d => d.featureId),
  })),
  selections: {
    timeIndex: 0,
    dataType: 'blueWaterStress',
  },
};

// Don't keep raw and temporary data in memory
rawWaterData = null;
yearlyGroupedData = null;

export const initialState = defaultState;

export function dataReducer(state = initialState.waterData, _action: Action): TimeAggregate[] {
  return state;
}

export function selectionsReducer(state = initialState.selections, action: Action) {
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
  waterData: dataReducer,
});

export * from './types';
