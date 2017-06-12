import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');
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
  AggregateStressShortageDatum,
  RawAggregateStressShortageDatum,
  RawRegionStressShortageDatum,
  StressShortageDatum,
  TimeAggregate,
  toAggregateStressShortageDatum,
  toStressShortageDatum,
} from '../types';
import { StateTree } from './types';

let rawStressShortageData:
  | RawRegionStressShortageDatum[]
  | null = require('../../data/FPU_decadal_bluewater.json');
let yearlyGroupedData: RawRegionStressShortageDatum[][] | null = values(
  groupBy(rawStressShortageData!, ({ startYear }) => startYear),
).sort((a, b) => a[0].startYear - b[0].startYear);

let rawAggregateData:
  | RawAggregateStressShortageDatum[]
  | null = require('../../data/worldRegion_decadal_bluewater.json');
let yearlyGroupedAggregateData:
  | RawAggregateStressShortageDatum[][]
  | null = values(
  groupBy(rawAggregateData!, ({ startYear }) => startYear),
).sort((a, b) => a[0].startYear - b[0].startYear);

const defaultState: StateTree = {
  routing: {} as any,
  stressShortageData: yearlyGroupedData.map(group => ({
    startYear: group[0].startYear,
    endYear: group[0].endYear,
    data: keyBy(group.map(toStressShortageDatum), d => d.featureId),
  })),
  aggregateData: yearlyGroupedAggregateData.map(group => ({
    startYear: group[0].startYear,
    endYear: group[0].endYear,
    data: keyBy(group.map(toAggregateStressShortageDatum), d => d.featureId),
  })),
  selections: {
    timeIndex: 0,
    dataType: 'blueWaterStress',
    globalRegion: 0, // 0 means global
  },
};

// Don't keep raw and temporary data in memory
rawStressShortageData = null;
yearlyGroupedData = null;
rawAggregateData = null;
yearlyGroupedAggregateData = null;

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
});

export * from './types';
