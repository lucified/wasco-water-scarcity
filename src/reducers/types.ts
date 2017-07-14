import { RouterState } from 'react-router-redux';

import { FutureData, FutureDataset, WaterRegionGeoJSON } from '../data/types';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export interface StateTree {
  data: {
    stressShortageData?: Array<TimeAggregate<StressShortageDatum>>;
    futureData: {
      [variableName: string]: { annual?: FutureData; decadal?: FutureData };
    };
    worldRegions?: WorldRegion[];
    waterRegions?: WaterRegionGeoJSON;
    waterToWorldRegionsMap?: { [waterId: number]: number };
  };
  routing: RouterState;
  thresholds: {
    stress: number[];
    shortage: number[];
    scarcity: number[];
  };
  selections: {
    timeIndex: number;
    futureTimeIndex: number;
    futureDataset: FutureDataset;
    dataType: DataType;
    impactModel: string;
    climateModel: string;
    timeScale: TimeScale;
    worldRegion: number;
    region?: number;
  };
}
