import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';

import {
  loadFutureData,
  setSelectedClimateModel,
  setSelectedDataType,
  setSelectedFutureScenario,
  setSelectedImpactModel,
} from '../../../actions';
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
}

interface GeneratedStateProps {
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  selectedFutureData?: FutureData;
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
      selectedFutureDataset,
      selectedFutureData,
      selectedDataType,
    } = this.props;

    // Default to stress if scarcity is selected
    if (selectedDataType === 'scarcity') {
      this.props.setSelectedDataType('stress');
    }

    if (!selectedFutureData) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    this.verifyDataExistsForSelectedScenario();
  }

  private verifyDataExistsForSelectedScenario() {
    const { mapData, selectedFutureData } = this.props;

    if (selectedFutureData && !mapData) {
      // This means we have fetched the data but have currently selected a
      // scenario for which data does not exist. Switch to the default one.
      let defaultScenario = selectedFutureData.find(d => !!d.default);
      if (!defaultScenario) {
        console.warn('Missing default scenario for dataset');
        defaultScenario = selectedFutureData[0];
      }
      if (!defaultScenario) {
        console.error('No scenarios for dataset!');
      } else {
        const {
          climateModel,
          climateExperiment,
          impactModel,
          population,
        } = defaultScenario;
        this.props.setSelectedFutureScenario(
          climateModel,
          climateExperiment,
          impactModel,
          population,
        );
      }
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
      !nextProps.selectedFutureData
    ) {
      nextProps.loadFutureData(nextProps.selectedFutureDataset);
    }

    this.verifyDataExistsForSelectedScenario();
  }

  public render() {
    const {
      mapData,
      waterRegions,
      selectedDataType,
      selectedFutureData,
      selectedClimateModel,
      selectedImpactModel,
      selectedClimateExperiment,
      selectedPopulation,
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
            <FutureScenarioFilter />
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
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureBody);
