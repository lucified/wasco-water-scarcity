import { Dataset } from './types';

const datasets: Dataset[] = [
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'h08',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2005',
    filename:
      'FPU_annual_bluewater_h08_gfdl-esm2m_hist_pressoc_airruse_1971_2005.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'h08',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2004',
    filename:
      'FPU_annual_bluewater_h08_hadgem2-es_hist_pressoc_airruse_1971_2004.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '1971',
    endYear: '2005',
    filename:
      'FPU_annual_bluewater_lpjml_gfdl-esm2m_hist_pressoc_co2_airruse_1971_2005.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '1971',
    endYear: '2005',
    filename:
      'FPU_annual_bluewater_lpjml_gfdl-esm2m_hist_pressoc_noco2_airruse_1971_2005.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '1971',
    endYear: '2004',
    filename:
      'FPU_annual_bluewater_lpjml_hadgem2-es_hist_pressoc_co2_airruse_1971_2004.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '1971',
    endYear: '2004',
    filename:
      'FPU_annual_bluewater_lpjml_hadgem2-es_hist_pressoc_noco2_airruse_1971_2004.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2005',
    filename:
      'FPU_annual_bluewater_pcrglobwb_gfdl-esm2m_hist_pressoc_airruse_1971_2005.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2004',
    filename:
      'FPU_annual_bluewater_pcrglobwb_hadgem2-es_hist_pressoc_airruse_1971_2004.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP1_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP2_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2006',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2006_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2005',
    endYear: '2099',
    filename:
      'FPU_annual_bluewater_SSP3_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2005_2099.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'wbm',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2005',
    filename:
      'FPU_annual_bluewater_wbm_gfdl-esm2m_hist_pressoc_airruse_1971_2005.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'annual',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'wbm',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2004',
    filename:
      'FPU_annual_bluewater_wbm_hadgem2-es_hist_pressoc_airruse_1971_2004.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'watergap',
    climateModel: 'watch',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1901',
    endYear: '2010',
    filename: 'FPU_decadal_bluewater.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'h08',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_h08_gfdl-esm2m_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'h08',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_h08_hadgem2-es_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_lpjml_gfdl-esm2m_hist_pressoc_co2_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_lpjml_gfdl-esm2m_hist_pressoc_noco2_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_lpjml_hadgem2-es_hist_pressoc_co2_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_lpjml_hadgem2-es_hist_pressoc_noco2_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_pcrglobwb_gfdl-esm2m_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_pcrglobwb_hadgem2-es_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP1',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP1_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP2',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP2_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_gfdl-esm2m_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_gfdl-esm2m_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_gfdl-esm2m_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_hadgem2-es_rcp4p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_hadgem2-es_rcp4p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'co2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_hadgem2-es_rcp8p5_pressoc_co2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'lpjml',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'noco2',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_lpjml_hadgem2-es_rcp8p5_pressoc_noco2_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_pcrglobwb_gfdl-esm2m_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_pcrglobwb_gfdl-esm2m_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp4p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_pcrglobwb_hadgem2-es_rcp4p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'SSP3',
    impactModel: 'pcrglobwb',
    climateModel: 'hadgem2-es',
    climateExperiment: 'rcp8p5',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '2001',
    endYear: '2090',
    filename:
      'FPU_decadal_bluewater_SSP3_pcrglobwb_hadgem2-es_rcp8p5_pressoc_airruse_2001_2090.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'wbm',
    climateModel: 'gfdl-esm2m',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_wbm_gfdl-esm2m_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
  {
    spatialUnit: 'FPU',
    timeScale: 'decadal',
    dataType: 'bluewater',
    population: 'hist',
    impactModel: 'wbm',
    climateModel: 'hadgem2-es',
    climateExperiment: 'hist',
    socialForcing: 'pressoc',
    co2Forcing: 'NA',
    startYear: '1971',
    endYear: '2000',
    filename:
      'FPU_decadal_bluewater_wbm_hadgem2-es_hist_pressoc_airruse_1971_2000.json', // tslint:disable:max-line-length
  },
];

export default datasets;
