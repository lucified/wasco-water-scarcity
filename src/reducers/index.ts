import groupBy = require('lodash/groupBy');
import keyBy = require('lodash/keyBy');
import values = require('lodash/values');
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import { Action, SET_TIME_INDEX } from '../actions';
import { RawWaterDatum, StateTree, TimeAggregate, toWaterDatum } from './types';

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
  selectedTimeIndex: 0,
};

// Don't keep raw and temporary data in memory
rawWaterData = null;
yearlyGroupedData = null;

export const initialState = defaultState;

export function dataReducer(state = initialState.waterData, _action: Action): TimeAggregate[] {
  return state;
}

export function timeIndexReducer(state = initialState.selectedTimeIndex, action: Action): number {
  switch (action.type) {
    case SET_TIME_INDEX:
      return action.value;
  }

  return state;
}

export default combineReducers<StateTree>({
  routing: routerReducer,
  selectedTimeIndex: timeIndexReducer,
  waterData: dataReducer,
});

export * from './types';
