import { RouterState } from 'react-router-redux';

import { FutureData, FutureDataset, WaterRegionGeoJSON } from '../data/types';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export interface SelectionsTree {
  timeIndex: number;
  futureTimeIndex: number;
  futureDataset: FutureDataset;
  futureFilters: {
    impactModels: string[];
    climateModels: string[];
    climateExperiments: string[];
    populations: string[];
  };
  dataType: DataType;
  impactModel: string;
  climateModel: string;
  climateExperiment: string; // Only used in Future page
  population: string; // Only used in Future page
  timeScale: TimeScale;
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
  futureData: {
    [variableName: string]: { annual?: FutureData; decadal?: FutureData };
  };
  worldRegions?: WorldRegion[];
  waterRegions?: WaterRegionGeoJSON;
  waterToWorldRegionsMap?: { [waterId: number]: number };
}

export interface StateTree {
  data: DataTree;
  routing: RouterState;
  thresholds: ThresholdsTree;
  selections: SelectionsTree;
}
