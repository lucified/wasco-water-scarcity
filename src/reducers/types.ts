import { RouterState } from 'react-router-redux';

import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';

export interface StateTree {
  stressShortageData: Array<TimeAggregate<StressShortageDatum>>;
  worldRegions: WorldRegion[];
  routing: RouterState;
  thresholds: {
    stress: number[];
    shortage: number[];
    scarcity: number[];
  };
  selections: {
    timeIndex: number;
    dataType: DataType;
    worldRegion: number;
    region?: number;
  };
}
