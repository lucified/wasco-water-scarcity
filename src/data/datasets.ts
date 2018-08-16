// tslint:disable:max-line-length

import { FutureDataset, HistoricalDataset } from './types';

// prettier-ignore
export const historicalDataset: HistoricalDataset =   {
  urlTemplateScenario:'https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/v3-20180820/FPU_{{timeScale}}_bluewater_{{impactModel}}_{{climateModel}}_hist_varsoc_co2.json',
  timeScale:['annual','decadal'],
  impactModel: ['h08', 'pcr-globwb', 'watergap2','watergap-nat'],
  climateModel: ['gswp3','princeton','watch','wfdei'],
  default:{
    timeScale:'decadal',
    impactModel:'watergap-nat',
    climateModel:'watch'
  }
};

export const futureDatasets: FutureDataset[] = [
  // Note: there will be datasets for other variables
  {
    urlTemplateEnsemble:
      'https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/futuredata_v4-20180727/ensemble_fpu_decadal/{{variableName}}/{{featureId}}/all.json',
    urlTemplateScenario:
      'https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/futuredata_v4-20180727/scenario_fpu_decadal/' +
      'fpu_decadal_bluewater_{{impactModel}}_{{climateModel}}_{{climateExperiment}}_pressoc/' +
      '{{yieldGap}}_{{dietChange}}_{{foodLossRed}}_{{population}}_{{trade}}_{{agriExp}}_{{reuse}}_{{alloc}}.json',
    variableName: ['stress', 'kcal'],
    impactModel: ['h08', 'pcrglobwb', 'watergap', 'mean'],
    climateModel: ['gfdl-esm2m', 'hadgem2-es', 'mean'],
    climateExperiment: ['rcp4p5', 'rcp6p0'],
    yieldGap: ['current', 'medium', 'high'],
    dietChange: ['current', 'medium', 'high'],
    foodLossRed: ['current', 'medium', 'high'],
    population: ['SSP1', 'SSP2', 'SSP3'],
    trade: ['none', 'current volume'],
    agriExp: ['current', 'increase'],
    reuse: ['maxfood', 'minwater', 'meetfood'],
    alloc: ['runoff', 'discharge'],
  },
];
