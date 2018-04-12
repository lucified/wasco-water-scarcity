import {
  FutureDataset,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  WaterRegionGeoJSON,
} from '../data';
import {
  FutureDataType,
  HistoricalDataType,
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
  historicalDataType: HistoricalDataType;
  futureDataType: FutureDataType;
  impactModel: string; // Only used in Historical pages
  climateModel: string; // Only used in Historical pages
  selectedFutureScenario?: FutureScenario; // Only used in Future page
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
  futureEnsembleData: {
    [variableName: string]: FutureEnsembleData;
  };
  futureScenarioData: {
    [scenarioId: string]: FutureScenarioData;
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
