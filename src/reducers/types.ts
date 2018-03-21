import {
  FutureData,
  FutureDataset,
  SelectedScen,
  WaterRegionGeoJSON,
} from '../data';
import {
  DataType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
  WorldRegion,
} from '../types';

export interface SelectionsTree {
  historicalTimeIndex: number;
  lockHistoricalTimeIndex: boolean;
  futureTimeIndex: number;
  futureDataset: FutureDataset;
  futureFilters: {
    impactModels: string[];
    climateModels: string[];
    climateExperiments: string[];
    populations: string[];
  };
  dataType: DataType;
  impactModel: string; // Only used in Historical pages
  climateModel: string; // Only used in Historical pages
  selectedScen: SelectedScen; // Only used in Future page
  lockFutureScenario: boolean;
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
  thresholds: ThresholdsTree;
  selections: SelectionsTree;
}
