import { WaterRegionGeoJSON } from '../data';
import {
  AnyDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export interface SelectionsTree {
  historicalTimeIndex: number;
  lockHistoricalTimeIndex: boolean;
  impactModel: string; // Only used in Past pages
  climateModel: string; // Only used in Past pages
  timeScale: TimeScale; // Only used in Past pages
  worldRegion: number;
  region?: number;
}

export type ThresholdsTree = { [dataType in AnyDataType]: number[] };

export interface DataTree {
  stressShortageData?: Array<TimeAggregate<StressShortageDatum>>;
  worldRegions?: WorldRegion[];
  waterRegions?: WaterRegionGeoJSON;
  waterToWorldRegionsMap?: { [waterId: number]: number };
}

export interface StateTree {
  data: DataTree;
  thresholds: ThresholdsTree;
  selections: SelectionsTree;
  requests: string[];
}
