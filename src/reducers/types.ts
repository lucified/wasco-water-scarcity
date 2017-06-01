import { RouterState } from 'react-router-redux';

import { DataType, TimeAggregate } from '../types';

export interface StateTree {
  waterData: TimeAggregate[];
  // TODO: Remove react-router if not used?
  routing: RouterState;
  selections: {
    timeIndex: number;
    dataType: DataType;
    region?: number;
  };
}
