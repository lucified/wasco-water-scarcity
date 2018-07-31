import { invert, omit, pick } from 'lodash';
import { parse, ParseOptions, stringify, StringifyOptions } from 'query-string';
import { Middleware } from 'redux';
import { Action } from './actions';
import { State as FuturePageState } from './components/pages/future';
import { GridVariable } from './data';
import { SelectionsTree, StateTree, ThresholdsTree } from './reducers';
import { AppType } from './types';

const urlToSelectionsState: { [paramName: string]: keyof SelectionsTree } = {
  im: 'impactModel',
  cm: 'climateModel',
  ts: 'timeScale',
  t: 'historicalTimeIndex',
  wr: 'worldRegion',
  r: 'region',
  gv: 'selectedGridVariable',
  z: 'zoomedInToRegion',
};
const selectionsStateToUrl = invert(urlToSelectionsState);
const clearableGlobalStateValues: Array<keyof SelectionsTree> = ['region'];

const urlToThresholdsState: { [paramName: string]: keyof ThresholdsTree } = {
  strt: 'stress',
  shot: 'shortage',
  kcat: 'kcal',
};
const thresholdsStateToUrl = invert(urlToThresholdsState);

const urlToFuturePageState: { [paramName: string]: keyof FuturePageState } = {
  scen: 'selectedScenario',
  comp: 'comparisonVariables',
  ti: 'selectedTimeIndex',
  enth: 'ensembleThresholds',
};
const futurePageStateToUrl = invert(urlToFuturePageState);

const QUERY_STRING_OPTIONS: ParseOptions & StringifyOptions = {
  arrayFormat: 'index',
};

function globalStateToHashObject(state: StateTree, appType: AppType) {
  let selectionMembersToUse: Array<keyof SelectionsTree> = [];
  let thresholdMembersToUse: Array<keyof ThresholdsTree> = [];
  switch (appType) {
    case AppType.FUTURE:
      // The future page stores selection state in the path (via react-router)
      selectionMembersToUse = ['worldRegion', 'region', 'zoomedInToRegion'];
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
  return { ...selections, ...thresholds };
}

export function futurePageStateToHashObject(state: FuturePageState) {
  return (Object.keys(futurePageStateToUrl) as Array<
    keyof FuturePageState
  >).reduce<{ [key: string]: any }>((result, member) => {
    switch (member) {
      case 'selectedScenario':
      case 'comparisonVariables':
        result[futurePageStateToUrl[member]] = toBase64String(state[member]);
        break;
      case 'selectedTimeIndex':
        result[futurePageStateToUrl[member]] = state[member];
        break;
      case 'ensembleThresholds':
        result[futurePageStateToUrl[member]] = `${
          state.ensembleThresholds.stress
        };${state.ensembleThresholds.kcal}`;
        break;
    }
    return result;
  }, {});
}

export function getFuturePageStateFromURLHash(): Partial<FuturePageState> {
  const hashContents = parse(window.location.hash, QUERY_STRING_OPTIONS);
  const ret: Partial<FuturePageState> = {};

  Object.keys(pick(hashContents, Object.keys(urlToFuturePageState))).forEach(
    key => {
      const value = hashContents[key];
      switch (key) {
        case 'ti':
          const parsedNumber = parseInt(value, 10);
          if (!isNaN(parsedNumber)) {
            ret[urlToFuturePageState[key]] = parsedNumber;
          }
          break;
        case 'scen':
        case 'comp':
          ret[urlToFuturePageState[key]] = fromBase64String(value);
          break;
        case 'enth':
          const [stress, kcal] = value.split(';');
          ret[urlToFuturePageState[key]] = {
            stress,
            kcal,
          };
          break;
      }
    },
  );

  return ret;
}

export function addFuturePageStateToURL(state: FuturePageState) {
  const hashData = {
    ...parse(window.location.hash, QUERY_STRING_OPTIONS),
    ...futurePageStateToHashObject(state),
  };
  const hash = `#${stringify(hashData, QUERY_STRING_OPTIONS)}`;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}

export function getGlobalStateFromURLHash(): {
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
      case 'gv':
        // TODO: validate
        selections[urlToSelectionsState[key]] = value as GridVariable;
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
      case 'z':
        selections[urlToSelectionsState[key]] = value === 'true';
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

    let hashData;
    if (appType === AppType.FUTURE) {
      // We need to combine existing data in the URL since it also contains
      // future page state in it.
      hashData = {
        // We need to manually remove the clearable values since otherwise any
        // value in the URL will always remain there.
        ...omit(
          parse(window.location.hash, QUERY_STRING_OPTIONS),
          ...clearableGlobalStateValues.map(key => selectionsStateToUrl[key]),
        ),
        ...globalStateToHashObject(getState(), appType),
      };
    } else {
      hashData = globalStateToHashObject(getState(), appType);
    }
    const hash = `#${stringify(hashData, QUERY_STRING_OPTIONS)}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }

    return result;
  };
}

function toBase64String(obj: any) {
  return btoa(JSON.stringify(obj));
}

function fromBase64String(str: string) {
  return JSON.parse(atob(str));
}
