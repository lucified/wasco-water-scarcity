import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import {
  loadFutureData,
  setSelectedClimateModel,
  setSelectedDataType,
  setSelectedImpactModel,
  setSelectedScenario,
} from '../../../actions';
import { FutureData, FutureDataset, WaterRegionGeoJSON } from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getSelectedClimateExperiment,
  getSelectedClimateModel,
  getSelectedDataType,
  getSelectedFutureDataset,
  getSelectedFutureScenario,
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
import { theme } from '../../theme';
import TimeScaleSelector from '../../time-scale-selector';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioDescription from './future-scenario-description';
import FutureScenarioFilter from './future-scenario-filter';

const DataSelectors = styled.div`
  padding-top: ${theme.margin(1.5)};
`;

const StyledSpinner = styled(Spinner)`
  margin-top: 40px;
`;

const Error = styled.div`
  margin-top: 40px;
  text-align: center;
`;

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
  loadFutureData: (dataset: FutureDataset) => void;
  setSelectedImpactModel: (model: string) => void;
  setSelectedClimateModel: (model: string) => void;
  setSelectedScenario: (
    climateModel: string,
    climateExperiment: string,
    impactModel: string,
    population: string,
  ) => void;
}

interface GeneratedStateProps {
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  allScenariosInSelectedDataset?: FutureData;
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
      allScenariosInSelectedDataset,
      selectedDataType,
    } = this.props;

    // Default to stress if scarcity is selected
    if (selectedDataType === 'scarcity') {
      this.props.setSelectedDataType('stress');
    }

    if (!allScenariosInSelectedDataset) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    this.verifyDataExistsForSelectedScenario();
  }

  public componentDidUpdate(prevProps: Props) {
    const { allScenariosInSelectedDataset, selectedFutureDataset } = this.props;
    if (
      prevProps.selectedFutureDataset !== this.props.selectedFutureDataset &&
      !allScenariosInSelectedDataset
    ) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    this.verifyDataExistsForSelectedScenario();
  }

  private verifyDataExistsForSelectedScenario() {
    const { mapData, allScenariosInSelectedDataset } = this.props;

    if (allScenariosInSelectedDataset && !mapData) {
      // This means we have fetched the data but have currently selected a
      // scenario for which data does not exist. Switch to the default one.
      let defaultScenario = allScenariosInSelectedDataset.find(
        d => !!d.default,
      );
      if (!defaultScenario) {
        console.warn('Missing default scenario for dataset');
        defaultScenario = allScenariosInSelectedDataset[0];
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
        this.props.setSelectedScenario(
          climateModel,
          climateExperiment,
          impactModel,
          population,
        );
      }
    }
  }

  private handleLineHover = (scenarioId: string) => {
    const hoveredData = this.props.allScenariosInSelectedDataset!.find(
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
      this.props.setSelectedScenario(
        climateModel,
        climateExperiment,
        impactModel,
        population,
      );
    }
  };

  public render() {
    const {
      mapData,
      waterRegions,
      selectedDataType,
      allScenariosInSelectedDataset,
      selectedClimateModel,
      selectedImpactModel,
      selectedClimateExperiment,
      selectedPopulation,
    } = this.props;

    const yearString =
      mapData &&
      (mapData.startYear !== mapData.endYear
        ? `${mapData.startYear}-${mapData.endYear}`
        : mapData.startYear);
    const yearLabel = mapData && ` for ${yearString}`;

    return (
      <div>
        <div className="row between-xs">
          <div className="col-xs-12 col-md-8">
            <h1>The Future?</h1>
            <FutureScenarioFilter
              impactModel={selectedImpactModel}
              climateModel={selectedClimateModel}
              climateExperiment={selectedClimateExperiment}
              population={selectedPopulation}
            />
          </div>
          <DataSelectors className="col-xs-12 col-md-offset-1 col-md-3">
            <DataTypeSelector hideScarcity />
            <TimeScaleSelector />
          </DataSelectors>
        </div>
        {!waterRegions || !allScenariosInSelectedDataset ? (
          <StyledSpinner />
        ) : (
          <div>
            <div className="row bottom-xs between-xs">
              <div className="col-xs-12 col-md-8">
                <FutureLineChart
                  onLineHover={this.handleLineHover}
                  width={790}
                  height={240}
                />
              </div>
              <div className="col-xs-12 col-md-4">
                <FutureScenarioDescription
                  estimateLabel={selectedDataType}
                  includeConsumption={selectedDataType === 'stress'}
                  climateModel={selectedClimateModel}
                  climateExperiment={selectedClimateExperiment}
                  population={selectedPopulation}
                  impactModel={selectedImpactModel}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Selected scenario{yearLabel}</h2>
                {!mapData ? (
                  <Error>No data found for selected model.</Error>
                ) : (
                  <div>
                    <Map
                      width={1000}
                      selectedData={mapData}
                      waterRegions={waterRegions}
                    />
                    <WorldRegionSelector />
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <CrossReferences fromPage="future" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const futureData = getSelectedFutureScenario(state);
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
    allScenariosInSelectedDataset: getAllScenariosInSelectedFutureDataset(
      state,
    ),
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
    setSelectedScenario: (
      climateModel: string,
      climateExperiment: string,
      impactModel: string,
      population: string,
    ) => {
      dispatch(
        setSelectedScenario(
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
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(FutureBody);
