import { invert } from 'lodash';
import { parse, ParseOptions, stringify, StringifyOptions } from 'query-string';
import { Middleware } from 'redux';
import { Action } from './actions';
import { SelectionsTree, StateTree, ThresholdsTree } from './reducers';
import { AppType } from './types';

const urlToSelectionsState: { [paramName: string]: keyof SelectionsTree } = {
  im: 'impactModel',
  cm: 'climateModel',
  ts: 'timeScale',
  t: 'historicalTimeIndex',
  wr: 'worldRegion',
  r: 'region',
};

const selectionsStateToUrl = invert(urlToSelectionsState);

const urlToThresholdsState: { [paramName: string]: keyof ThresholdsTree } = {
  strt: 'stress',
  shot: 'shortage',
  kcat: 'kcal',
};

const thresholdsStateToUrl = invert(urlToThresholdsState);

const QUERY_STRING_OPTIONS: ParseOptions & StringifyOptions = {
  arrayFormat: 'index',
};

function stateToHash(state: StateTree, appType: AppType) {
  let selectionMembersToUse: Array<keyof SelectionsTree> = [];
  let thresholdMembersToUse: Array<keyof ThresholdsTree> = [];
  switch (appType) {
    case AppType.FUTURE:
      // The future page stores selection state in the path (via react-router)
      selectionMembersToUse = ['worldRegion', 'region'];
      thresholdMembersToUse = ['stress', 'shortage', 'kcal'];
      break;
    case AppType.PAST:
      selectionMembersToUse = Object.keys(selectionsStateToUrl) as Array<
        keyof SelectionsTree
      >;
      thresholdMembersToUse = ['stress', 'shortage'];
      break;
    default:
      return '';
  }
  const selections = selectionMembersToUse
    // Some keys might be empty, e.g. region
    .filter(member => state.selections[member] != null)
    .reduce<{ [key: string]: any }>((result, member) => {
      result[selectionsStateToUrl[member]] = state.selections[member];
      return result;
    }, {});
  const thresholds = thresholdMembersToUse.reduce<{ [key: string]: any }>(
    (result, member) => {
      result[thresholdsStateToUrl[member]] = state.thresholds[member];
      return result;
    },
    {},
  );
  return stringify({ ...selections, ...thresholds }, QUERY_STRING_OPTIONS);
}

export function getURLHashContents(): {
  selections: Partial<SelectionsTree>;
  thresholds: Partial<ThresholdsTree>;
} {
  const hashContents = parse(window.location.hash, QUERY_STRING_OPTIONS);
  const selections: Partial<SelectionsTree> = {};
  const thresholds: Partial<ThresholdsTree> = {};

  Object.keys(hashContents).forEach(key => {
    const value: string | string[] = hashContents[key];
    let num: number;

    switch (key) {
      case 't':
      case 'r':
      case 'wr':
        num = parseInt(value as string, 10);
        if (isNaN(num)) {
          console.error('Invalid value', value, 'for key', key);
          return;
        }
        selections[urlToSelectionsState[key]] = num;
        break;
      case 'im':
      case 'cm':
        // TODO: validate
        selections[urlToSelectionsState[key]] = value as string;
        break;
      case 'ts':
        if (['annual', 'decadal'].indexOf(value as string) === -1) {
          console.error('Invalid value for time scale', value);
          return;
        }
        selections[urlToSelectionsState[key]] = value as string;
        break;
      case 'strt':
      case 'shot':
      case 'kcat':
        if (Array.isArray(value)) {
          const numberArray = value.map(Number);
          if (numberArray.some(isNaN)) {
            console.error('Invalid value', value, 'for key', key);
            return;
          }
          thresholds[urlToThresholdsState[key]] = numberArray;
        }
        break;
      default:
        return;
    }
  });

  return {
    selections,
    thresholds,
  };
}

export function createMiddleware(appType: AppType): Middleware {
  return ({ getState }) => next => (action: Action) => {
    const result = next(action);

    const hash = `#${stateToHash(getState(), appType)}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }

    return result;
  };
}
