import { isEqual } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
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
import { ResponsiveMap } from '../../map/responsive';
import { theme } from '../../theme';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioFilter from './future-scenario-filter';
const Sticky = require('react-stickynode');

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.defaultMargin}px;
`;

const Title = styled.h1`
  margin: 0;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  margin-top: ${theme.defaultMargin}px;
`;

const Scroll = styled.div`
  position: relative;
  display: block;
`;

const selectorsWidth = '40%';

const SelectorsContent = styled.div`
  position: relative;
  width: ${selectorsWidth};
  padding-right: ${theme.defaultMargin}px;
`;

const StickyGraphics = styled(Sticky)`
  left: calc(100% - ${selectorsWidth});
  width: calc(100% - ${selectorsWidth});
  height: 100%;
  float: right;
`;

const DataSelectors = styled.div``;

const StyledSpinner = styled(Spinner)`
  margin-top: 40px;
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
  allEnsemblesInSelectedDataset?: FutureEnsembleData;
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
      allEnsemblesInSelectedDataset,
      selectedWorldRegionId,
    } = this.props;

    if (!allEnsemblesInSelectedDataset) {
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
      this.props.loadFutureEnsembleData(
        this.props.selectedFutureDataset,
        this.props.selectedWaterRegionId
          ? this.props.selectedWaterRegionId.toString()
          : `world-${this.props.selectedWorldRegionId}_0.2`, // TODO: allow user to choose threshold
      );
    }
    this.verifyDataExistsForSelectedScenario();
  }

  private verifyDataExistsForSelectedScenario() {
    const {
      futureEnsembleData,
      allEnsemblesInSelectedDataset,
      mapData,
      selectedScenario,
      selectedFutureDataset,
    } = this.props;

    if (allEnsemblesInSelectedDataset) {
      if (!futureEnsembleData) {
        // This means we have fetched the data but have currently selected a
        // scenario for which data does not exist. Switch to the default one.
        let defaultScenario = allEnsemblesInSelectedDataset.find(
          d => !!d.default,
        );
        if (!defaultScenario) {
          console.warn('Missing default scenario for dataset');
          defaultScenario = allEnsemblesInSelectedDataset[0];
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
    const hoveredData = this.props.allEnsemblesInSelectedDataset!.find(
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
      allEnsemblesInSelectedDataset,
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
        <HeaderRow>
          <Title>How do you view the Future?</Title>
          <DataSelectors>
            <DataTypeSelector hideScarcity />
          </DataSelectors>
        </HeaderRow>
        {!waterRegions ||
        !allEnsemblesInSelectedDataset ||
        !selectedScenario ? (
          <StyledSpinner />
        ) : (
          <Container>
            <Scroll>
              <StickyGraphics>
                <FutureLineChart
                  onLineHover={this.handleLineHover}
                  height={220}
                />
                <h2>Selected scenario{yearLabel}</h2>
                {!mapData ? (
                  <Error>No data found for selected model.</Error>
                ) : (
                  <div>
                    <ResponsiveMap
                      selectedData={mapData}
                      waterRegions={waterRegions}
                    />
                    <WorldRegionSelector />
                  </div>
                )}
              </StickyGraphics>
              <SelectorsContent>
                <FutureScenarioFilter selectedScenario={selectedScenario} />
              </SelectorsContent>
            </Scroll>
          </Container>
        )}
      </div>
    );
  }
}

const Future = connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  {},
  StateTree
>(
  state => ({
    futureEnsembleData: getEnsembleDataForSelectedFutureScenario(state),
    mapData: getMapDataForSelectedFutureScenario(state),
    waterRegions: getWaterRegionData(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    allEnsemblesInSelectedDataset: getAllScenariosInSelectedFutureDataset(
      state,
    ),
    selectedScenario: getSelectedFutureScenario(state),
    selectedFutureDataset: getSelectedFutureDataset(state),
    selectedDataType: getSelectedFutureDataType(state),
  }),
  dispatch => ({
    setSelectedDataType: (dataType: FutureDataType) => {
      dispatch(setSelectedFutureDataType(dataType));
    },
    loadFutureEnsembleData: (dataset: FutureDataset, featureId: string) => {
      // TODO: remove 'as any' once this is resolved: https://github.com/gaearon/redux-thunk/issues/169
      dispatch(loadFutureEnsembleData(dataset, featureId) as any);
    },
    loadFutureScenarioData: (
      dataset: FutureDataset,
      scenario: FutureScenario,
    ) => {
      // TODO: remove 'as any' once this is resolved: https://github.com/gaearon/redux-thunk/issues/169
      dispatch(loadFutureScenarioData(dataset, scenario) as any);
    },
    setSelectedScenario: (scen: FutureScenario) => {
      dispatch(setSelectedScenario(scen));
    },
  }),
)(FutureBody);

export default Future;
