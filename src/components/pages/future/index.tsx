import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import {
  loadFutureData,
  setSelectedDataType,
  setSelectedScenario,
} from '../../../actions';
import {
  FutureDataForModel,
  FutureData,
  FutureDataset,
  SelectedScen,
  WaterRegionGeoJSON,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getSelectedScen,
  getSelectedDataType,
  getSelectedFutureDataset,
  getSelectedFutureScenario,
  getSelectedFutureTimeIndex,
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, TimeAggregate } from '../../../types';
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
  setSelectedDataType: (dataType: DataType) => void;
  loadFutureData: (dataset: FutureDataset, featureId: string) => void;
  setSelectedScenario: (scen: SelectedScen) => void;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  allScenariosInSelectedDataset?: FutureData;
  futureData?: FutureDataForModel;
  selectedScen: SelectedScen;
  mapData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

class FutureBody extends React.Component<Props> {
  public componentDidMount() {
    const {
      selectedFutureDataset,
      allScenariosInSelectedDataset,
      selectedDataType,
      selectedWorldRegionId,
    } = this.props;

    // Default to stress if scarcity is selected
    if (selectedDataType === 'scarcity') {
      this.props.setSelectedDataType('stress');
    }

    if (!allScenariosInSelectedDataset) {
      this.props.loadFutureData(
        selectedFutureDataset,
        'world-' + String(selectedWorldRegionId),
      );
    }

    this.verifyDataExistsForSelectedScenario();
  }

  public componentDidUpdate(prevProps: Props) {
    //TODO: seems a bit buggy depending on when redux store is changed?
    if (
      prevProps.selectedFutureDataset !== this.props.selectedFutureDataset ||
      prevProps.selectedWaterRegionId !== this.props.selectedWaterRegionId ||
      prevProps.selectedWorldRegionId !== this.props.selectedWorldRegionId
    ) {
      //Note: don't store, so no check if already loaded
      if (this.props.selectedWaterRegionId) {
        this.props.loadFutureData(
          this.props.selectedFutureDataset,
          String(this.props.selectedWaterRegionId),
        );
      } else {
        this.props.loadFutureData(
          this.props.selectedFutureDataset,
          'world-' + String(this.props.selectedWorldRegionId),
        );
      }
    }
    this.verifyDataExistsForSelectedScenario();
  }

  private verifyDataExistsForSelectedScenario() {
    const { futureData, allScenariosInSelectedDataset } = this.props;

    if (allScenariosInSelectedDataset && !futureData) {
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
        this.props.setSelectedScenario(defaultScenario);
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
      selectedScen,
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
            <FutureScenarioFilter selectedScen={selectedScen} />
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
                <StyledFutureScenarioDescription
                  estimateLabel={selectedDataType}
                  includeConsumption={selectedDataType === 'stress'}
                  selectedScen={selectedScen}
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
  const futureData = getSelectedFutureScenario(state);
  let mapData: TimeAggregate<number> | undefined;

  const selectedScen = getSelectedScen(state);
  const selectedFutureDataset = getSelectedFutureDataset(state);
  const selectedDataType = getSelectedDataType(state);

  if (futureData) {
    mapData = undefined;
    const mapData_url = Object.keys(selectedScen).reduce(
      (prev: string, key: string) =>
        prev.replace(
          '{{' + key + '}}',
          String(selectedScen[key as keyof SelectedScen]),
        ),
      selectedFutureDataset.urlTemplateScenario,
    );
    const timeIndex = getSelectedFutureTimeIndex(state);
    console.log(`Fetch mapData at ${timeIndex} from: ${mapData_url}`);
    //TODO
    //let futureScenarioData : Array<TimeAggregate<{stress:number,kcal:number}>>
    // const { y0: startYear, y1: endYear, regions } = futureScenarioData[timeIndex];
    // mapData = {
    //   startYear,
    //   endYear,
    //   data: Object.keys(regions).forEach(k => {[k]:regions[k][selectedDataType]}),
    // };
  }

  return {
    futureData,
    mapData,
    waterRegions: getWaterRegionData(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    selectedDataType: selectedDataType,
    allScenariosInSelectedDataset: getAllScenariosInSelectedFutureDataset(
      state,
    ),
    selectedFutureDataset: selectedFutureDataset,
    selectedScen: selectedScen,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
    loadFutureData: (dataset: FutureDataset, featureId: string) => {
      dispatch(loadFutureData(dataset, featureId));
    },
    setSelectedScenario: (scen: SelectedScen) => {
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
