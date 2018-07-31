import { isEqual, mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import {
  fetchFutureEnsembleData,
  fetchFutureScenarioData,
  FutureDataset,
  FutureDatasetVariables,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioData,
  getDefaultComparison,
  getDefaultFutureDataset,
  getDefaultFutureScenario,
  KcalEnsembleThreshold,
  StartingPoint,
  StressEnsembleThreshold,
  toEnsembleRegionId,
  toEnsembleWorldId,
  toScenarioId,
  WaterRegionGeoJSON,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getWaterRegionData,
  isZoomedInToRegion,
} from '../../../selectors';
import { FutureDataType } from '../../../types';
import {
  addFuturePageStateToURL,
  getFuturePageStateFromURLHash,
} from '../../../url-state';
import Spinner from '../../generic/spinner';
import { ResponsiveMap } from '../../map/responsive';
import { SmallSectionHeader, theme, Title, TitleContainer } from '../../theme';
import WorldRegionSelector from '../../world-region-selector';
import DataTypeLinks from './data-type-links';
import { EnsembleThresholdSelector } from './ensemble-threshold-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioFilter from './future-scenario-filter';
import MapPlaceholder from './map-placeholder';
import { TimeSelector } from './time-selector';
const Sticky = require('react-stickynode');

const BodyContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  margin-top: ${theme.margin()};
`;

const selectorsWidth = '400px';

const SelectorsContent = styled.div`
  position: relative;
  width: ${selectorsWidth};
  padding-right: ${theme.margin()};
`;

const StickyGraphics = styled(Sticky)`
  width: calc(100% - ${selectorsWidth});
`;

const StyledSpinner = styled(Spinner)`
  margin-top: 40px;
`;

const Error = styled.div`
  margin-top: 40px;
  text-align: center;
`;

const MapHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TimeSelectorContainer = styled.div`
  max-width: 300px;
  width: 100%;
  padding-right: ${theme.defaultMargin}px;
`;

function ensembleRequestId(areaId: string, dataType: FutureDataType) {
  return `${dataType}-${areaId}`;
}

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId: number;
  waterRegions?: WaterRegionGeoJSON;
  isZoomedIn: boolean;
}

interface PassedProps {
  selectedDataType: FutureDataType;
}

export interface State {
  selectedTimeIndex: number;
  comparisonVariables: FutureDatasetVariables;
  selectedScenario: FutureScenario;
  selectedDataset: FutureDataset;
  hoveredScenarios?: FutureEnsembleData;
  ensembleThresholds: {
    stress: StressEnsembleThreshold;
    kcal: KcalEnsembleThreshold;
  };
  ensemblesRequested: string[];
  scenariosRequested: string[];
  ensembleData: {
    [dataType in FutureDataType]: {
      [regionId: string]: FutureEnsembleData | undefined;
    }
  };
  scenarioData: {
    [scenarioId: string]: FutureScenarioData | undefined;
  };
}

export type Props = GeneratedStateProps & PassedProps;

const initialURLContents = getFuturePageStateFromURLHash();

class FutureBody extends React.Component<Props, State> {
  public state: State = {
    selectedScenario: getDefaultFutureScenario(),
    selectedDataset: getDefaultFutureDataset(),
    selectedTimeIndex: 0,
    ensembleThresholds: {
      stress: '0.2',
      kcal: 2355,
    },
    comparisonVariables: getDefaultComparison(StartingPoint.CHANGE_THE_WORLD),
    ensembleData: { stress: {}, kcal: {} },
    scenarioData: {},
    ensemblesRequested: [],
    scenariosRequested: [],
    ...initialURLContents,
  };

  private getMapData = createSelector(
    (state: State, _props: Props) =>
      state.scenarioData[toScenarioId(state.selectedScenario)],
    (state: State, _props: Props) => state.selectedTimeIndex,
    (_state: State, props: Props) => props.selectedDataType,
    (scenarioData, timeIndex, dataType) => {
      if (!scenarioData) {
        return undefined;
      }

      const timeObject = scenarioData[timeIndex];
      if (!timeObject) {
        return undefined;
      }
      const { y0: startYear, y1: endYear, data: timeData } = timeObject;
      return {
        startYear,
        endYear,
        data: mapValues(timeData, d => d[dataType]),
      };
    },
  );

  private getTimeLabels = createSelector(
    // Note: the time labels should be the same for all scenarios
    (state: State) => state.scenarioData[toScenarioId(state.selectedScenario)],
    scenarioData => {
      if (!scenarioData) {
        return undefined;
      }

      return scenarioData.reduce<{ [index: number]: string }>(
        (result, datum, index) => {
          const { y0, y1 } = datum;
          result[index] = y0 !== y1 ? `${y0}-${y1}` : `${y0}`;
          return result;
        },
        {},
      );
    },
  );

  private async fetchFutureEnsembleData(
    dataset: FutureDataset,
    featureId: string,
    dataType: FutureDataType,
  ) {
    const requestId = ensembleRequestId(featureId, dataType);
    if (this.state.ensemblesRequested.indexOf(requestId) > -1) {
      console.error('Already loading ensemble', requestId);
      return;
    }
    this.setState(state => ({
      ensemblesRequested: state.ensemblesRequested.concat(requestId),
    }));
    const ensembleData = await fetchFutureEnsembleData(
      dataset,
      featureId,
      dataType,
    );
    // TODO: check that memory usage doesn't explode if we store all responses
    this.setState(state => ({
      ensembleData: ensembleData
        ? {
            ...state.ensembleData,
            [dataType]: {
              ...state.ensembleData[dataType],
              [featureId]: ensembleData,
            },
          }
        : state.ensembleData,
      ensemblesRequested: state.ensemblesRequested.filter(
        id => id !== requestId,
      ),
    }));
  }

  private async fetchFutureScenarioData(
    dataset: FutureDataset,
    scenario: FutureScenario,
  ) {
    const scenarioId = toScenarioId(scenario);
    if (this.state.scenariosRequested.indexOf(scenarioId) > -1) {
      console.error('Already loading scenario', scenarioId);
      return;
    }
    this.setState(state => ({
      scenariosRequested: state.scenariosRequested.concat(scenarioId),
    }));
    const scenarioData = await fetchFutureScenarioData(dataset, scenario);
    this.setState(state => ({
      scenarioData: scenarioData
        ? {
            ...state.scenarioData,
            [scenarioId]: scenarioData,
          }
        : state.scenarioData,
      scenariosRequested: state.scenariosRequested.filter(
        id => id !== scenarioId,
      ),
    }));
  }

  public componentDidMount() {
    const {
      selectedDataset,
      selectedScenario,
      ensembleThresholds,
    } = this.state;
    const {
      selectedWorldRegionId,
      selectedWaterRegionId,
      selectedDataType,
    } = this.props;

    const ensembleAreaId = selectedWaterRegionId
      ? toEnsembleRegionId(selectedWaterRegionId)
      : toEnsembleWorldId(
          selectedWorldRegionId,
          ensembleThresholds[selectedDataType],
        );

    this.fetchFutureEnsembleData(
      selectedDataset,
      ensembleAreaId,
      selectedDataType,
    );
    this.fetchFutureScenarioData(selectedDataset, selectedScenario);
  }

  public componentWillReceiveProps({
    selectedDataType,
    selectedWaterRegionId,
    selectedWorldRegionId,
  }: Props) {
    if (
      selectedWaterRegionId !== this.props.selectedWaterRegionId ||
      selectedWorldRegionId !== this.props.selectedWorldRegionId ||
      selectedDataType !== this.props.selectedDataType
    ) {
      const { selectedDataset, ensembleData, ensembleThresholds } = this.state;
      const ensembleAreaId = selectedWaterRegionId
        ? toEnsembleRegionId(selectedWaterRegionId)
        : toEnsembleWorldId(
            selectedWorldRegionId,
            ensembleThresholds[selectedDataType],
          );
      if (!ensembleData[selectedDataType][ensembleAreaId]) {
        this.fetchFutureEnsembleData(
          selectedDataset,
          ensembleAreaId,
          selectedDataType,
        );
      }
    }
  }

  private handleSetComparisonVariables = (
    comparisonVariables: FutureDatasetVariables,
  ) => {
    this.setState({ comparisonVariables }, () => {
      addFuturePageStateToURL(this.state);
    });
  };

  private handleSetSelectedScenario = (scenario: FutureScenario) => {
    const { selectedScenario, scenarioData, selectedDataset } = this.state;
    if (!isEqual(selectedScenario, scenario)) {
      if (!scenarioData[toScenarioId(scenario)]) {
        this.fetchFutureScenarioData(selectedDataset, scenario);
      }
      this.setState({ selectedScenario: scenario }, () => {
        addFuturePageStateToURL(this.state);
      });
    }
  };

  private handleSetHoveredScenarios = (
    hoveredScenarios?: FutureEnsembleData,
  ) => {
    this.setState({ hoveredScenarios });
  };

  private handleSetEnsembleThreshold = (
    ensembleThreshold: StressEnsembleThreshold | KcalEnsembleThreshold,
  ) => {
    const { selectedWorldRegionId, selectedDataType } = this.props;
    const { selectedDataset, ensembleData, ensembleThresholds } = this.state;
    if (ensembleThresholds[selectedDataType] !== ensembleThreshold) {
      const featureId = toEnsembleWorldId(
        selectedWorldRegionId,
        ensembleThreshold,
      );
      if (!ensembleData[selectedDataType][featureId]) {
        this.fetchFutureEnsembleData(
          selectedDataset,
          featureId,
          selectedDataType,
        );
      }
      this.setState(state => ({
        ensembleThresholds: {
          ...state.ensembleThresholds,
          [selectedDataType]: ensembleThreshold,
        },
      }));
    }
  };

  private handleTimeIndexChange = (newIndex: number) => {
    if (this.state.selectedTimeIndex !== newIndex) {
      this.setState({ selectedTimeIndex: newIndex }, () => {
        addFuturePageStateToURL(this.state);
      });
    }
  };

  public render() {
    const {
      waterRegions,
      selectedWaterRegionId,
      selectedWorldRegionId,
      selectedDataType,
      isZoomedIn,
    } = this.props;
    const {
      selectedTimeIndex,
      selectedScenario,
      selectedDataset,
      comparisonVariables,
      scenariosRequested,
      ensemblesRequested,
      ensembleData,
      hoveredScenarios,
      ensembleThresholds,
    } = this.state;
    const mapData = this.getMapData(this.state, this.props);
    const ensembleAreaId = selectedWaterRegionId
      ? toEnsembleRegionId(selectedWaterRegionId)
      : toEnsembleWorldId(
          selectedWorldRegionId,
          ensembleThresholds[selectedDataType],
        );

    const timeLabels = this.getTimeLabels(this.state);

    return (
      <div>
        <TitleContainer className="container">
          <Title>Explore possible futures of water scarcity</Title>
        </TitleContainer>
        <DataTypeLinks />
        <BodyContainer className="container">
          <SelectorsContent>
            <FutureScenarioFilter
              setScenario={this.handleSetSelectedScenario}
              selectedFutureDataset={selectedDataset}
              selectedScenario={selectedScenario}
              comparisonVariables={comparisonVariables}
              ensembleData={ensembleData[selectedDataType][ensembleAreaId]}
              setComparisonVariables={this.handleSetComparisonVariables}
              setHoveredScenarios={this.handleSetHoveredScenarios}
            />
          </SelectorsContent>
          <StickyGraphics>
            {!waterRegions ||
            (!mapData && !ensembleData[selectedDataType][ensembleAreaId]) ? (
              <StyledSpinner />
            ) : (
              <>
                <MapHeaderRow>
                  <SmallSectionHeader>Selected scenario</SmallSectionHeader>
                  <TimeSelectorContainer>
                    {timeLabels && (
                      <TimeSelector
                        min={0}
                        max={Object.keys(timeLabels).length - 1}
                        value={selectedTimeIndex}
                        onChange={this.handleTimeIndexChange}
                        labels={timeLabels}
                        labelStyle={{
                          fontFamily: theme.bodyFontFamily,
                          fontSize: 14,
                          width: '50%',
                          marginLeft: '-25%',
                        }}
                      />
                    )}
                  </TimeSelectorContainer>
                </MapHeaderRow>
                {!mapData ? (
                  scenariosRequested.indexOf(toScenarioId(selectedScenario)) >
                  -1 ? (
                    <MapPlaceholder />
                  ) : (
                    <Error>No data found for selected scenario.</Error>
                  )
                ) : (
                  <>
                    <ResponsiveMap
                      selectedData={mapData}
                      waterRegions={waterRegions}
                      selectedDataType={selectedDataType}
                    />
                    {!isZoomedIn && <WorldRegionSelector />}
                  </>
                )}
                {!ensembleData[selectedDataType][ensembleAreaId] ? (
                  ensemblesRequested.indexOf(
                    ensembleRequestId(ensembleAreaId, selectedDataType),
                  ) > -1 ? (
                    <div style={{ height: 220 }}>
                      <StyledSpinner />
                    </div>
                  ) : (
                    <Error style={{ height: 220 }}>
                      No data found for selected area.
                    </Error>
                  )
                ) : (
                  <FutureLineChart
                    height={220}
                    selectedTimeIndex={selectedTimeIndex}
                    selectedDataType={selectedDataType}
                    ensembleData={
                      ensembleData[selectedDataType][ensembleAreaId]!
                    }
                    selectedWorldRegionId={selectedWorldRegionId}
                    selectedWaterRegionId={selectedWaterRegionId}
                    comparisonVariables={comparisonVariables}
                    selectedScenario={selectedScenario}
                    onTimeIndexChange={this.handleTimeIndexChange}
                    hoveredScenarios={hoveredScenarios}
                  />
                )}
                {selectedWaterRegionId == null && (
                  <EnsembleThresholdSelector
                    threshold={ensembleThresholds[selectedDataType]}
                    dataType={selectedDataType}
                    onChange={this.handleSetEnsembleThreshold}
                  />
                )}
              </>
            )}
          </StickyGraphics>
        </BodyContainer>
      </div>
    );
  }
}

const Future = connect<GeneratedStateProps, {}, PassedProps, StateTree>(
  state => ({
    waterRegions: getWaterRegionData(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    isZoomedIn: isZoomedInToRegion(state),
  }),
)(FutureBody);

export default Future;
