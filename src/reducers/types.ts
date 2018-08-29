import { GridVariable, RegionSearchTerms, WaterRegionGeoJSON } from '../data';
import {
  AnyDataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

// Most of these are used only in the past page
export interface SelectionsTree {
  historicalTimeStartYear: number;
  historicalTimeEndYear: number;
  lockHistoricalTimeIndex: boolean;
  impactModel: string;
  climateModel: string;
  timeScale: TimeScale;
  worldRegion: number; // Also used in future page
  region?: number; // Also used in future page
  zoomedInToRegion: boolean; // Also used in future page
  selectedGridVariable: GridVariable;
}

export type ThresholdsTree = { [dataType in AnyDataType]: number[] };

export interface DataTree {
  stressShortageData: {
    [scenarioId: string]: Array<TimeAggregate<StressShortageDatum>> | undefined;
  };
  regionSearchTerms?: RegionSearchTerms[];
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
