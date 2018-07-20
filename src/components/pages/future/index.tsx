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
  isFutureDataType,
  StartingPoint,
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
} from '../../../selectors';
import { FutureDataType } from '../../../types';
import RadioSelector, { Option } from '../../generic/radio-selector';
import Spinner from '../../generic/spinner';
import { ResponsiveMap } from '../../map/responsive';
import {
  BodyContainer,
  DataTypeSelectorContainer,
  Scroll,
  SelectorsContent,
  SmallSectionHeader,
  StickyGraphics,
  theme,
  Title,
  TitleContainer,
} from '../../theme';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';
import FutureScenarioFilter from './future-scenario-filter';
import MapPlaceholder from './map-placeholder';
import { TimeSelector } from './time-selector';

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

const DATA_TYPE_OPTIONS: Array<{ label: string; value: FutureDataType }> = [
  { label: 'Water stress', value: 'stress' },
  { label: 'Food production', value: 'kcal' },
];

interface GeneratedStateProps {
  selectedWaterRegionId?: number;
  selectedWorldRegionId: number;
  waterRegions?: WaterRegionGeoJSON;
}

interface State {
  selectedScenario: FutureScenario;
  selectedDataType: FutureDataType;
  selectedDataset: FutureDataset;
  selectedTimeIndex: number;
  comparisonVariables: FutureDatasetVariables;
  hoveredScenarios?: FutureEnsembleData;
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

type Props = GeneratedStateProps;

class FutureBody extends React.Component<Props, State> {
  public state: State = {
    selectedDataType: 'stress',
    selectedScenario: getDefaultFutureScenario(),
    selectedDataset: getDefaultFutureDataset(),
    selectedTimeIndex: 0,
    comparisonVariables: getDefaultComparison(StartingPoint.CHANGE_THE_WORLD),
    ensembleData: { stress: {}, kcal: {} },
    scenarioData: {},
    ensemblesRequested: [],
    scenariosRequested: [],
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
    const { selectedDataset, selectedScenario, selectedDataType } = this.state;
    const { selectedWorldRegionId } = this.props;

    this.fetchFutureEnsembleData(
      selectedDataset,
      toEnsembleWorldId(selectedWorldRegionId),
      selectedDataType,
    );
    this.fetchFutureScenarioData(selectedDataset, selectedScenario);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.selectedWaterRegionId !== this.props.selectedWaterRegionId ||
      nextProps.selectedWorldRegionId !== this.props.selectedWorldRegionId
    ) {
      const { ensembleData, selectedDataset, selectedDataType } = this.state;
      const ensembleAreaId = nextProps.selectedWaterRegionId
        ? toEnsembleRegionId(nextProps.selectedWaterRegionId)
        : toEnsembleWorldId(nextProps.selectedWorldRegionId);
      if (!ensembleData[selectedDataType][ensembleAreaId]) {
        this.fetchFutureEnsembleData(
          selectedDataset,
          ensembleAreaId,
          selectedDataType,
        );
      }
    }
  }

  private setDataType = ({ value: dataType }: Option) => {
    if (!isFutureDataType(dataType)) {
      console.error('Not a valid dataType', dataType);
      return;
    }
    const { selectedDataType, ensembleData, selectedDataset } = this.state;
    const { selectedWaterRegionId, selectedWorldRegionId } = this.props;
    if (dataType !== selectedDataType) {
      const areaId = selectedWaterRegionId
        ? toEnsembleRegionId(selectedWaterRegionId)
        : toEnsembleWorldId(selectedWorldRegionId);
      if (!ensembleData[dataType][areaId]) {
        this.fetchFutureEnsembleData(selectedDataset, areaId, dataType);
      }
      this.setState({ selectedDataType: dataType });
    }
  };

  private handleSetComparisonVariables = (
    comparisonVariables: FutureDatasetVariables,
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

  private handleSetHoveredScenarios = (
    hoveredScenarios?: FutureEnsembleData,
  ) => {
    this.setState({ hoveredScenarios });
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
      scenariosRequested,
      ensemblesRequested,
      ensembleData,
      hoveredScenarios,
    } = this.state;
    const mapData = this.getMapData(this.state);
    const ensembleAreaId = selectedWaterRegionId
      ? toEnsembleRegionId(selectedWaterRegionId)
      : toEnsembleWorldId(selectedWorldRegionId);

    const timeLabels = this.getTimeLabels(this.state);

    return (
      <div>
        <TitleContainer>
          <Title>Explore possible futures of water scarcity</Title>
          <DataTypeSelectorContainer>
            <RadioSelector
              values={DATA_TYPE_OPTIONS}
              selectedValue={selectedDataType}
              onChange={this.setDataType}
            />
          </DataTypeSelectorContainer>
        </TitleContainer>
        <BodyContainer>
          <Scroll>
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
                      <WorldRegionSelector />
                    </>
                  )}
                  {!ensembleData[selectedDataType][ensembleAreaId] ? (
                    ensemblesRequested.indexOf(
                      ensembleRequestId(ensembleAreaId, selectedDataType),
                    ) > -1 ? (
                      <StyledSpinner />
                    ) : (
                      <Error>No data found for selected area.</Error>
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
                </>
              )}
            </StickyGraphics>
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
          </Scroll>
        </BodyContainer>
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
