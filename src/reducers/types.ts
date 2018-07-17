import { WaterRegionGeoJSON } from '../data';
import {
  HistoricalDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export interface SelectionsTree {
  historicalTimeIndex: number;
  lockHistoricalTimeIndex: boolean;
  historicalDataType: HistoricalDataType;
  impactModel: string; // Only used in Past pages
  climateModel: string; // Only used in Past pages
  timeScale: TimeScale; // Only used in Past pages
  worldRegion: number;
  region?: number;
}

export interface ThresholdsTree {
  stress: number[];
  shortage: number[];
  scarcity: number[];
}

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
}
