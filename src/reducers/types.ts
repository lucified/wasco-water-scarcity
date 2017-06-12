import { RouterState } from 'react-router-redux';

import {
  AggregateStressShortageDatum,
  DataType,
  StressShortageDatum,
  TimeAggregate,
} from '../types';

export interface StateTree {
  stressShortageData: Array<TimeAggregate<StressShortageDatum>>;
  aggregateData: Array<TimeAggregate<AggregateStressShortageDatum>>;
  routing: RouterState;
  selections: {
    timeIndex: number;
    dataType: DataType;
    globalRegion: number;
    region?: number;
  };
}
