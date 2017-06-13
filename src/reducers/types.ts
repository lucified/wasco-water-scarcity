import { RouterState } from 'react-router-redux';

import {
  AggregateStressShortageDatum,
  DataType,
  StressShortageDatum,
  TimeAggregate,
  WorldRegion,
} from '../types';

export interface StateTree {
  stressShortageData: Array<TimeAggregate<StressShortageDatum>>;
  aggregateData: Array<TimeAggregate<AggregateStressShortageDatum>>;
  worldRegions: WorldRegion[];
  routing: RouterState;
  selections: {
    timeIndex: number;
    dataType: DataType;
    worldRegion: number;
    region?: number;
  };
}
