import { isEqual } from 'lodash';
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
  FutureData,
  FutureDataForModel,
  FutureDataset,
  FutureScenario,
  getFutureScenarioURL,
  WaterRegionGeoJSON,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getAllScenariosInSelectedFutureDataset,
  getDataForSelectedFutureScenario,
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
  setSelectedScenario: (scen: FutureScenario) => void;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  allScenariosInSelectedDataset?: FutureData;
  futureData?: FutureDataForModel;
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
        // TODO: allow user to choose threshold
        `world-${String(selectedWorldRegionId)}_0.2`,
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
        this.props.loadFutureData(
          this.props.selectedFutureDataset,
          this.props.selectedWaterRegionId.toString(),
        );
      } else {
        this.props.loadFutureData(
          this.props.selectedFutureDataset,
          // TODO: allow user to choose threshold
          `world-${this.props.selectedWorldRegionId}_0.2`,
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
            <TimeScaleSelector />
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
  const futureData = getDataForSelectedFutureScenario(state);
  let mapData: TimeAggregate<number> | undefined;

  const selectedScenario = getSelectedFutureScenario(state);
  const selectedFutureDataset = getSelectedFutureDataset(state);
  const selectedDataType = getSelectedDataType(state);

  if (futureData && selectedScenario) {
    mapData = undefined;
    const mapDataUrl = getFutureScenarioURL(
      selectedFutureDataset,
      selectedScenario,
    );
    const timeIndex = getSelectedFutureTimeIndex(state);
    console.error(`Fetch mapData at ${timeIndex} from: ${mapDataUrl}`);
    // TODO
    // let futureScenarioData : Array<TimeAggregate<{stress:number,kcal:number}>>
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
    selectedDataType,
    allScenariosInSelectedDataset: getAllScenariosInSelectedFutureDataset(
      state,
    ),
    selectedFutureDataset,
    selectedScenario,
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
