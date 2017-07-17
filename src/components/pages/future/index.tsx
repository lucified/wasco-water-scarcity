import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';

import {
  loadFutureData,
  setSelectedClimateModel,
  setSelectedDataType,
  setSelectedFutureFilters,
  setSelectedFutureScenario,
  setSelectedImpactModel,
} from '../../../actions';
import {
  getHistoricalClimateModels,
  getHistoricalImpactModels,
} from '../../../data';
import {
  FutureData,
  FutureDataset,
  WaterRegionGeoJSON,
} from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateExperiment,
  getSelectedClimateModel,
  getSelectedDataType,
  getSelectedFutureDataForScenario,
  getSelectedFutureDataset,
  getSelectedFutureDatasetData,
  getSelectedFutureFilters,
  getSelectedFutureTimeIndex,
  getSelectedImpactModel,
  getSelectedPopulation,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, TimeAggregate } from '../../../types';

import CrossReferences from '../../cross-references';
import DataTypeSelector from '../../data-type-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import TimeScaleSelector from '../../time-scale-selector';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioDescription from './future-scenario-description';
import FutureScenarioFilter from './future-scenario-filter';

import * as styles from './index.scss';

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
  loadFutureData: (dataset: FutureDataset) => void;
  setSelectedImpactModel: (model: string) => void;
  setSelectedClimateModel: (model: string) => void;
  setSelectedFutureScenario: (
    climateModel: string,
    climateExperiment: string,
    impactModel: string,
    population: string,
  ) => void;
  setSelectedFutureFilters: (
    climateModels: string[],
    climateExperiments: string[],
    impactModels: string[],
    populations: string[],
  ) => void;
}

interface GeneratedStateProps {
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  selectedFutureData?: FutureData;
  selectedFutureFilters: {
    climateModels: string[];
    climateExperiments: string[];
    impactModels: string[];
    populations: string[];
  };
  selectedImpactModel: string;
  selectedClimateModel: string;
  selectedClimateExperiment: string;
  selectedPopulation: string;
  mapData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps & GeneratedStateProps & GeneratedDispatchProps;

class FutureBody extends React.Component<Props> {
  public componentDidMount() {
    const {
      mapData,
      selectedFutureDataset,
      selectedClimateModel,
      selectedImpactModel,
      selectedDataType,
    } = this.props;

    // Default to stress if scarcity is selected
    if (selectedDataType === 'scarcity') {
      this.props.setSelectedDataType('stress');
    }

    // TODO: replace this with something proper
    this.props.setSelectedFutureScenario(
      'gfdl-esm2m',
      'rcp8p5',
      'lpjml',
      'SSP1',
    );

    if (!mapData) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    if (
      selectedClimateModel === 'watch' ||
      selectedImpactModel === 'watergap'
    ) {
      // TODO: get future models instead
      this.props.setSelectedClimateModel(
        getHistoricalClimateModels().filter(m => m !== 'watch')[0],
      );
      this.props.setSelectedImpactModel(
        getHistoricalImpactModels().filter(m => m !== 'watergap')[0],
      );
    }
  }

  private handleLineHover = (scenarioId: string) => {
    const hoveredData = this.props.selectedFutureData!.find(
      d => d.scenarioId === scenarioId,
    );

    if (!hoveredData) {
      console.error('Error selecting line with scenario ID:', scenarioId);
    } else {
      const {
        climateModel,
        climateExperiment,
        impactModel,
        population,
      } = hoveredData;
      this.props.setSelectedFutureScenario(
        climateModel,
        climateExperiment,
        impactModel,
        population,
      );
    }
  };

  public componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.selectedFutureDataset !== this.props.selectedFutureDataset &&
      !nextProps.mapData
    ) {
      nextProps.loadFutureData(nextProps.selectedFutureDataset);
    }
  }

  private handleClimateModelFilterChange = (climateModels: string[]) => {
    const {
      selectedFutureFilters: { populations, climateExperiments, impactModels },
      setSelectedFutureFilters,
    } = this.props;

    setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handleClimateExperimentFilterChange = (
    climateExperiments: string[],
  ) => {
    const {
      selectedFutureFilters: { climateModels, populations, impactModels },
      setSelectedFutureFilters,
    } = this.props;

    setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handleImpactModelFilterChange = (impactModels: string[]) => {
    const {
      selectedFutureFilters: { climateModels, climateExperiments, populations },
      setSelectedFutureFilters,
    } = this.props;

    setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handlePopulationFilterChange = (populations: string[]) => {
    const {
      selectedFutureFilters: {
        climateModels,
        climateExperiments,
        impactModels,
      },
      setSelectedFutureFilters,
    } = this.props;

    setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  public render() {
    const {
      mapData,
      waterRegions,
      selectedDataType,
      selectedFutureData,
      selectedFutureDataset,
      selectedClimateModel,
      selectedImpactModel,
      selectedClimateExperiment,
      selectedPopulation,
      selectedFutureFilters,
    } = this.props;

    return (
      <div>
        <div className="row between-xs">
          <div
            className={classNames(
              'col-xs-12',
              'col-md-6',
              'col-lg-8',
              styles['body-text'],
            )}
          >
            <h1 className={styles['section-header']}>The Future?</h1>
            <p>
              <em>What can we do about this in the future?</em>
            </p>
            {!waterRegions || !selectedFutureData
              ? <Spinner />
              : !mapData
                ? <div className={styles.error}>
                    No data found for selected model.
                  </div>
                : <div>
                    <Map
                      width={800}
                      selectedData={mapData}
                      waterRegions={waterRegions}
                    />
                    <WorldRegionSelector />
                  </div>}
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-4', styles.selectors)}
          >
            <DataTypeSelector hideScarcity />
            <TimeScaleSelector />
            <FutureScenarioFilter
              climateModels={selectedFutureDataset.climateModels}
              selectedClimateModels={selectedFutureFilters.climateModels}
              onClimateModelChange={this.handleClimateModelFilterChange}
              climateExperiments={selectedFutureDataset.climateExperiments}
              selectedClimateExperiments={
                selectedFutureFilters.climateExperiments
              }
              onClimateExpirementChange={
                this.handleClimateExperimentFilterChange
              }
              impactModels={selectedFutureDataset.impactModels}
              selectedImpactModels={selectedFutureFilters.impactModels}
              onImpactModelChange={this.handleImpactModelFilterChange}
              populations={selectedFutureDataset.populations}
              selectedPopulations={selectedFutureFilters.populations}
              onPopulationChange={this.handlePopulationFilterChange}
            />
            <FutureScenarioDescription
              className={styles['secondary-content']}
              estimateLabel={selectedDataType}
              includeConsumption={selectedDataType === 'stress'}
              climateModel={selectedClimateModel}
              climateExperiment={selectedClimateExperiment}
              population={selectedPopulation}
              impactModel={selectedImpactModel}
            />
            <FutureLineChart onLineHover={this.handleLineHover} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <CrossReferences fromPage="future" />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const futureData = getSelectedFutureDataForScenario(state);
  let mapData: TimeAggregate<number> | undefined;

  if (futureData) {
    const timeIndex = getSelectedFutureTimeIndex(state);
    const { y0: startYear, y1: endYear, regions } = futureData.data[timeIndex];
    mapData = {
      startYear,
      endYear,
      data: regions,
    };
  }

  return {
    mapData,
    waterRegions: getWaterRegionData(state),
    selectedDataType: getSelectedDataType(state),
    selectedFutureData: getSelectedFutureDatasetData(state),
    selectedClimateModel: getSelectedClimateModel(state),
    selectedClimateExperiment: getSelectedClimateExperiment(state),
    selectedPopulation: getSelectedPopulation(state),
    selectedFutureDataset: getSelectedFutureDataset(state),
    selectedFutureFilters: getSelectedFutureFilters(state),
    selectedImpactModel: getSelectedImpactModel(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
    setSelectedClimateModel: (model: string) => {
      dispatch(setSelectedClimateModel(model));
    },
    setSelectedImpactModel: (model: string) => {
      dispatch(setSelectedImpactModel(model));
    },
    loadFutureData: (dataset: FutureDataset) => {
      dispatch(loadFutureData(dataset));
    },
    setSelectedFutureScenario: (
      climateModel: string,
      climateExperiment: string,
      impactModel: string,
      population: string,
    ) => {
      dispatch(
        setSelectedFutureScenario(
          climateModel,
          climateExperiment,
          impactModel,
          population,
        ),
      );
    },
    setSelectedFutureFilters: (
      climateModels: string[],
      climateExperiments: string[],
      impactModels: string[],
      populations: string[],
    ) => {
      dispatch(
        setSelectedFutureFilters(
          climateModels,
          climateExperiments,
          impactModels,
          populations,
        ),
      );
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureBody);
