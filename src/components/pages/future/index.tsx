import { isEqual, mapValues, omit } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createSelector } from '../../../../node_modules/reselect';
import {
  ComparisonVariables,
  fetchFutureEnsembleData,
  fetchFutureScenarioData,
  FutureDataset,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  getDefaultFutureScenario,
  getFutureDataset,
  // toEnsembleRegionId,
  toEnsembleWorldId,
  toScenarioId,
  WaterRegionGeoJSON,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getWaterRegionData,
} from '../../../selectors';
import { FutureDataType } from '../../../types';
import Spinner from '../../generic/spinner';
import { ResponsiveMap } from '../../map/responsive';
import { theme } from '../../theme';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioFilter from './future-scenario-filter';
const Sticky = require('react-stickynode');

const Title = styled.h1``;

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

const selectorsWidth = '400px';

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

const StyledSpinner = styled(Spinner)`
  margin-top: 40px;
`;

const Error = styled.div`
  margin-top: 40px;
  text-align: center;
`;

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  waterRegions?: WaterRegionGeoJSON;
}

interface State {
  selectedScenario: FutureScenario;
  selectedDataType: FutureDataType;
  selectedDataset: FutureDataset;
  selectedTimeIndex: number;
  comparisonVariables: ComparisonVariables;
  isLoadingEnsemble?: string;
  isLoadingScenario?: string;
  ensembleData: {
    [dataType in FutureDataType]: {
      [regionId: string]: FutureEnsembleData | undefined;
    }
  };
  scenarioData: {
    [scenarioId: string]: FutureScenarioData | undefined;
  };
}

type Props = GeneratedStateProps;

class FutureBody extends React.Component<Props, State> {
  public state: State = {
    selectedDataType: 'stress',
    selectedScenario: getDefaultFutureScenario(),
    selectedDataset: getFutureDataset('stress')!,
    selectedTimeIndex: 0,
    comparisonVariables: omit(
      getFutureDataset('stress')!,
      'urlTemplateEnsemble',
      'urlTemplateScenario',
      'variableName',
    ),
    ensembleData: { stress: {}, kcal: {} },
    scenarioData: {},
  };

  private getMapData = createSelector(
    (state: State) => state.scenarioData[toScenarioId(state.selectedScenario)],
    (state: State) => state.selectedTimeIndex,
    (state: State) => state.selectedDataType,
    (scenarioData, timeIndex, dataType) => {
      if (!scenarioData) {
        return undefined;
      }

      const { y0: startYear, y1: endYear, data: timeData } = scenarioData[
        timeIndex
      ];
      return {
        startYear,
        endYear,
        data: mapValues(timeData, d => d[dataType]),
      };
    },
  );

  private async fetchFutureEnsembleData(
    dataset: FutureDataset,
    featureId: string,
  ) {
    if (this.state.isLoadingEnsemble != null) {
      console.error('Already loading ensemble', this.state.isLoadingEnsemble);
      return;
    }
    this.setState({ isLoadingEnsemble: featureId });
    const ensembleData = await fetchFutureEnsembleData(dataset, featureId);
    if (ensembleData) {
      const dataType = dataset.variableName;
      // TODO: check that memory usage doesn't explode if we store all responses
      this.setState(state => ({
        ensembleData: {
          ...state.ensembleData,
          [dataType]: {
            ...state.ensembleData[dataType],
            [featureId]: ensembleData,
          },
        },
        isLoadingEnsemble: undefined,
      }));
    } else {
      this.setState({ isLoadingEnsemble: undefined });
    }
  }

  private async fetchFutureScenarioData(
    dataset: FutureDataset,
    scenario: FutureScenario,
  ) {
    const scenarioId = toScenarioId(scenario);
    if (this.state.isLoadingScenario != null) {
      console.error('Already loading scenario', this.state.isLoadingScenario);
      return;
    }
    this.setState({ isLoadingScenario: scenarioId });
    const scenarioData = await fetchFutureScenarioData(dataset, scenario);
    if (scenarioData) {
      this.setState(state => ({
        scenarioData: {
          ...state.scenarioData,
          [scenarioId]: scenarioData,
        },
        isLoadingScenario: undefined,
      }));
    } else {
      this.setState({ isLoadingScenario: undefined });
    }
  }

  public componentDidMount() {
    const { selectedDataset, selectedScenario } = this.state;
    const { selectedWorldRegionId } = this.props;

    this.fetchFutureEnsembleData(
      selectedDataset,
      toEnsembleWorldId(selectedWorldRegionId!),
    );
    this.fetchFutureScenarioData(selectedDataset, selectedScenario);
  }

  // private setDataType(dataType: FutureDataType) {
  //   const { selectedDataType, ensembleData } = this.state;
  //   const { selectedWaterRegionId, selectedWorldRegionId } = this.props;
  //   if (dataType !== selectedDataType) {
  //     const areaId = selectedWaterRegionId
  //       ? toEnsembleRegionId(selectedWaterRegionId)
  //       : toEnsembleWorldId(selectedWorldRegionId!);
  //     const dataset = getFutureDataset(dataType)!;
  //     this.setState({
  //       selectedDataType: dataType,
  //       selectedDataset: dataset,
  //     });
  //     // TODO: Check that we don't need to do this for the future scenario as well –
  //     // AFAIK the data for different data types is already included in the fetched
  //     // data and it only needs to be fetched if we change scenario.
  //     if (!ensembleData[dataType][areaId]) {
  //       this.fetchFutureEnsembleData(dataset, areaId);
  //     }
  //   }
  // }

  // private verifyDataExistsForSelectedScenario() {
  //   const {
  //     futureEnsembleData,
  //     allEnsemblesInSelectedDataset,
  //     mapData,
  //     selectedScenario,
  //     selectedFutureDataset,
  //   } = this.props;

  //   if (allEnsemblesInSelectedDataset) {
  //     if (!futureEnsembleData) {
  //       // This means we have fetched the data but have currently selected a
  //       // scenario for which data does not exist. Switch to the default one.
  //       let defaultScenario = allEnsemblesInSelectedDataset.find(
  //         d => !!d.default,
  //       );
  //       if (!defaultScenario) {
  //         console.warn('Missing default scenario for dataset');
  //         defaultScenario = allEnsemblesInSelectedDataset[0];
  //       }
  //       if (!defaultScenario) {
  //         console.error('No scenarios for dataset!');
  //       } else {
  //         this.setSelectedScenario(removeDataFromScenario(defaultScenario));
  //       }
  //     } else if (!mapData && selectedScenario) {
  //       this.props.loadFutureScenarioData(
  //         selectedFutureDataset,
  //         selectedScenario,
  //       );
  //     }
  //   }
  // }

  private handleSetComparisonVariables = (
    comparisonVariables: ComparisonVariables,
  ) => {
    this.setState({ comparisonVariables });
  };

  private handleSetSelectedScenario = (scenario: FutureScenario) => {
    const { selectedScenario, scenarioData, selectedDataset } = this.state;
    if (!isEqual(selectedScenario, scenario)) {
      if (!scenarioData[toScenarioId(scenario)]) {
        this.fetchFutureScenarioData(selectedDataset, scenario);
      }
      this.setState({ selectedScenario: scenario });
    }
  };

  private handleTimeIndexChange = (newIndex: number) => {
    if (this.state.selectedTimeIndex !== newIndex) {
      this.setState({ selectedTimeIndex: newIndex });
    }
  };

  public render() {
    const {
      waterRegions,
      selectedWaterRegionId,
      selectedWorldRegionId,
    } = this.props;
    const {
      selectedTimeIndex,
      selectedDataType,
      selectedScenario,
      selectedDataset,
      comparisonVariables,
      isLoadingScenario,
    } = this.state;
    const mapData = this.getMapData(this.state);

    const yearString =
      mapData &&
      (mapData.startYear !== mapData.endYear
        ? `${mapData.startYear}-${mapData.endYear}`
        : mapData.startYear);
    const yearLabel = mapData && ` for ${yearString}`;

    return (
      <div>
        <Title>Explore possible futures of water scarcity</Title>
        {!waterRegions ? (
          <StyledSpinner />
        ) : (
          <Container>
            <Scroll>
              <StickyGraphics>
                <FutureLineChart
                  height={220}
                  selectedTimeIndex={selectedTimeIndex}
                  selectedDataType={selectedDataType}
                  selectedWaterRegionId={selectedWaterRegionId}
                  selectedWorldRegionId={selectedWorldRegionId}
                  thresholds={[]} // TODO
                  onTimeIndexChange={this.handleTimeIndexChange}
                />
                <h2>Selected scenario{yearLabel}</h2>
                {!mapData ? (
                  isLoadingScenario === toScenarioId(selectedScenario) ? (
                    <StyledSpinner />
                  ) : (
                    <Error>No data found for selected model.</Error>
                  )
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
                <FutureScenarioFilter
                  setScenario={this.handleSetSelectedScenario}
                  selectedFutureDataset={selectedDataset}
                  selectedScenario={selectedScenario}
                  comparisonVariables={comparisonVariables}
                  setComparisonVariables={this.handleSetComparisonVariables}
                />
              </SelectorsContent>
            </Scroll>
          </Container>
        )}
      </div>
    );
  }
}

const Future = connect<GeneratedStateProps, {}, {}, StateTree>(state => ({
  waterRegions: getWaterRegionData(state),
  selectedWaterRegionId: getSelectedWaterRegionId(state),
  selectedWorldRegionId: getSelectedWorldRegionId(state),
}))(FutureBody);

export default Future;
