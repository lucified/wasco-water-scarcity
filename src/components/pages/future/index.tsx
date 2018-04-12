import { isEqual } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import {
  loadFutureEnsembleData,
  loadFutureScenarioData,
  setSelectedFutureDataType,
  setSelectedScenario,
} from '../../../actions';
import {
  FutureDataset,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioWithData,
  removeDataFromScenario,
  WaterRegionGeoJSON,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getEnsembleDataForSelectedFutureScenario,
  getMapDataForSelectedFutureScenario,
  getSelectedFutureDataset,
  getSelectedFutureDataType,
  getSelectedFutureScenario,
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getWaterRegionData,
} from '../../../selectors';
import { FutureDataType, TimeAggregate } from '../../../types';
import DataTypeSelector from '../../data-type-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import { theme } from '../../theme';
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

// TODO: Don't repeat this
const StyledFutureScenarioDescription = styled(FutureScenarioDescription)`
  font-family: ${theme.bodyFontFamily};
  font-size: 15px;
  padding-left: ${theme.margin()};
  padding-top: 5px;
  border-left: 1px solid ${theme.colors.grayLight};
  line-height: ${theme.bodyLineHeight};
  color: ${theme.colors.grayDarker};

  b {
    color: ${theme.colors.grayDarkest};
  }
`;

const Error = styled.div`
  margin-top: 40px;
  text-align: center;
`;

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: FutureDataType) => void;
  loadFutureEnsembleData: (dataset: FutureDataset, featureId: string) => void;
  loadFutureScenarioData: (
    dataset: FutureDataset,
    scenario: FutureScenario,
  ) => void;
  setSelectedScenario: (scen: FutureScenario) => void;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  selectedDataType: FutureDataType;
  selectedFutureDataset: FutureDataset;
  allScenariosInSelectedDataset?: FutureEnsembleData;
  futureEnsembleData?: FutureScenarioWithData;
  selectedScenario?: FutureScenario;
  mapData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

class FutureBody extends React.Component<Props> {
  public componentDidMount() {
    const {
      selectedFutureDataset,
      allScenariosInSelectedDataset,
      selectedWorldRegionId,
    } = this.props;

    if (!allScenariosInSelectedDataset) {
      this.props.loadFutureEnsembleData(
        selectedFutureDataset,
        // TODO: allow user to choose threshold
        `world-${selectedWorldRegionId}_0.2`,
      );
    }

    this.verifyDataExistsForSelectedScenario();
  }

  public componentDidUpdate(prevProps: Props) {
    // TODO: seems a bit buggy depending on when redux store is changed?
    if (
      prevProps.selectedWaterRegionId !== this.props.selectedWaterRegionId ||
      prevProps.selectedWorldRegionId !== this.props.selectedWorldRegionId ||
      !isEqual(
        prevProps.selectedFutureDataset,
        this.props.selectedFutureDataset,
      )
    ) {
      // Note: don't store, so no check if already loaded
      if (this.props.selectedWaterRegionId) {
        this.props.loadFutureEnsembleData(
          this.props.selectedFutureDataset,
          this.props.selectedWaterRegionId.toString(),
        );
      } else {
        this.props.loadFutureEnsembleData(
          this.props.selectedFutureDataset,
          // TODO: allow user to choose threshold
          `world-${this.props.selectedWorldRegionId}_0.2`,
        );
      }
    }
    this.verifyDataExistsForSelectedScenario();
  }

  private verifyDataExistsForSelectedScenario() {
    const {
      futureEnsembleData,
      allScenariosInSelectedDataset,
      mapData,
      selectedScenario,
      selectedFutureDataset,
    } = this.props;

    if (allScenariosInSelectedDataset) {
      if (!futureEnsembleData) {
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
          this.props.setSelectedScenario(
            removeDataFromScenario(defaultScenario),
          );
        }
      } else if (!mapData && selectedScenario) {
        this.props.loadFutureScenarioData(
          selectedFutureDataset,
          selectedScenario,
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
      this.props.setSelectedScenario(hoveredData);
    }
  };

  public render() {
    const {
      mapData,
      waterRegions,
      selectedDataType,
      allScenariosInSelectedDataset,
      selectedScenario,
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
            <FutureScenarioFilter selectedScenario={selectedScenario} />
          </div>
          <DataSelectors className="col-xs-12 col-md-offset-1 col-md-3">
            <DataTypeSelector hideScarcity />
          </DataSelectors>
        </div>
        {!waterRegions ||
        !allScenariosInSelectedDataset ||
        !selectedScenario ? (
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
                <StyledFutureScenarioDescription
                  estimateLabel={selectedDataType}
                  includeConsumption={selectedDataType === 'stress'}
                  selectedScenario={selectedScenario}
                />
              </div>{' '}
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
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    futureEnsembleData: getEnsembleDataForSelectedFutureScenario(state),
    mapData: getMapDataForSelectedFutureScenario(state),
    waterRegions: getWaterRegionData(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    allScenariosInSelectedDataset: getAllScenariosInSelectedFutureDataset(
      state,
    ),
    selectedScenario: getSelectedFutureScenario(state),
    selectedFutureDataset: getSelectedFutureDataset(state),
    selectedDataType: getSelectedFutureDataType(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: FutureDataType) => {
      dispatch(setSelectedFutureDataType(dataType));
    },
    loadFutureEnsembleData: (dataset: FutureDataset, featureId: string) => {
      dispatch(loadFutureEnsembleData(dataset, featureId));
    },
    loadFutureScenarioData: (
      dataset: FutureDataset,
      scenario: FutureScenario,
    ) => {
      dispatch(loadFutureScenarioData(dataset, scenario));
    },
    setSelectedScenario: (scen: FutureScenario) => {
      dispatch(setSelectedScenario(scen));
    },
  };
}

const Future = connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  {},
  StateTree
>(mapStateToProps, mapDispatchToProps)(FutureBody);

export default Future;
