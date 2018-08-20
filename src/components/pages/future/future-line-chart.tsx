import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import {
  FutureDatasetVariables,
  FutureEnsembleData,
  FutureScenario,
  getDataTypeColors,
  isFutureScenarioInComparisonVariables,
  isScenarioEqual,
  toFutureScenarioId,
} from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getNameForWorldRegionId,
  getThresholdsForDataType,
} from '../../../selectors';
import { FutureDataType } from '../../../types';
import {
  formatAxisNumber,
  formatLabel,
  formatPopulation,
} from '../../../utils';
import { CanvasLineChart } from '../../generic/canvas-line-chart';
import { CompareIcon } from '../../generic/compare-icon';
import responsive from '../../generic/responsive';
import { SmallSectionHeader, theme } from '../../theme';

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const LegendContainer = styled.div`
  display: flex;
  padding-right: ${theme.margin()};
`;

const LegendItem = styled.div`
  &:not(:first-child) {
    margin-left: ${theme.margin()};
  }
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(CompareIcon)`
  margin-right: 6px;
`;

// NOTE: We only have global memoized selectors which won't work if we ever
// decide to add a second future line chart.

const getComparisonSeries = createSelector(
  (props: Props) => props.ensembleData,
  (props: Props) => props.comparisonVariables,
  (data, comparisonVariables) => {
    const scenarioFilter = isFutureScenarioInComparisonVariables(
      comparisonVariables,
    );
    return data.filter(scenarioFilter).map(series => ({
      id: toFutureScenarioId(series),
      color: theme.colors.grayLight,
      points: series.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    }));
  },
);

const getSelectedSerie = createSelector(
  (props: Props) => props.ensembleData,
  (props: Props) => props.selectedScenario,
  (data, selectedScenario) => {
    const datum = data.find(d => isScenarioEqual(selectedScenario, d));
    if (!datum) {
      console.error('Unable to find selected scenario from ensemble');
      return undefined;
    }
    return {
      id: toFutureScenarioId(datum),
      color: theme.colors.textSelection,
      points: datum.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    };
  },
);

const getHoveredSeries = createSelector(
  (props: Props) => props.hoveredScenarios,
  data =>
    data &&
    data.map(datum => ({
      id: toFutureScenarioId(datum),
      color: theme.colors.gray,
      points: datum.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    })),
);

function labelForAxis(dataType: FutureDataType) {
  switch (dataType) {
    case 'stress':
      return 'Water stress';
    case 'kcal':
      return 'Kcal per person';
  }
}

function waterRegionTitle(dataType: FutureDataType) {
  switch (dataType) {
    case 'stress':
      return 'Water stress for region';
    case 'kcal':
      return 'Region food supply per person';
  }
}

function worldRegionTitle(dataType: FutureDataType, regionName: string) {
  switch (dataType) {
    case 'stress':
      return `${regionName} population living under water stress`;
    case 'kcal':
      return `${regionName} population with low food supply`;
  }
}

interface GeneratedStateProps {
  getWorldRegionName: (id: number) => string;
  thresholds: number[];
}

interface PassedProps {
  className?: string;
  selectedTimeIndex: number;
  selectedScenario: FutureScenario;
  selectedDataType: FutureDataType;
  selectedWaterRegionId?: number;
  selectedWorldRegionId: number;
  ensembleData: FutureEnsembleData;
  comparisonVariables: FutureDatasetVariables;
  hoveredScenarios?: FutureEnsembleData;
  onTimeIndexChange: (value: number) => void;
  width?: number;
  height?: number;
}

type Props = PassedProps & GeneratedStateProps;

function FutureLineChart(props: Props) {
  const {
    width,
    height,
    className,
    selectedDataType,
    selectedWaterRegionId,
    selectedWorldRegionId,
    selectedTimeIndex,
    onTimeIndexChange,
    getWorldRegionName,
    thresholds,
  } = props;

  const comparisonSeries = getComparisonSeries(props);
  const selectedSerie = getSelectedSerie(props);
  const hoveredSeries = getHoveredSeries(props);
  const isWaterRegionSelected = selectedWaterRegionId != null;
  const yAxisLabel = isWaterRegionSelected
    ? labelForAxis(selectedDataType)
    : '# of people';
  const title = isWaterRegionSelected
    ? waterRegionTitle(selectedDataType)
    : worldRegionTitle(
        selectedDataType,
        getWorldRegionName(selectedWorldRegionId),
      );

  const colors = getDataTypeColors(selectedDataType);
  const yAxisLabelColor =
    selectedDataType === 'kcal'
      ? (d: number) => {
          if (d <= thresholds[0]) {
            return colors[2];
          } else if (d <= thresholds[1]) {
            return colors[1];
          } else if (d <= thresholds[0]) {
            return colors[0];
          }

          // belowThresholdColor is a bit too light
          return theme.colors.gray;
        }
      : (d: number) => {
          if (d >= thresholds[2]) {
            return colors[2];
          } else if (d >= thresholds[1]) {
            return colors[1];
          } else if (d >= thresholds[0]) {
            return colors[0];
          }

          // belowThresholdColor is a bit too light
          return theme.colors.gray;
        };

  return (
    <>
      <HeaderRow>
        <SmallSectionHeader>{title}</SmallSectionHeader>
        <LegendContainer>
          <LegendItem style={{ color: theme.colors.textSelection }}>
            <svg
              viewBox="0 0 22 22"
              style={{ width: 22, height: 22, marginRight: 6 }}
            >
              <circle
                cx={11}
                cy={11}
                r={10}
                style={{
                  fill: 'none',
                  stroke: theme.colors.textSelection,
                  strokeWidth: 1,
                  strokeOpacity: 0.3,
                }}
              />
              <circle
                cx={11}
                cy={11}
                r={5}
                style={{
                  fill: theme.colors.textSelection,
                }}
              />
            </svg>
            Selected scenario
          </LegendItem>
          <LegendItem style={{ color: theme.colors.gray }}>
            <StyledIcon
              width={20}
              height={20}
              fill="white"
              backgroundColor={theme.colors.gray}
            />
            Comparison scenarios
          </LegendItem>
        </LegendContainer>
      </HeaderRow>
      <CanvasLineChart
        className={className}
        series={comparisonSeries}
        selectedSerie={selectedSerie}
        hoveredSeries={hoveredSeries}
        selectedTimeIndex={selectedTimeIndex}
        onSetSelectedTimeIndex={onTimeIndexChange}
        width={width || 600}
        height={height || 240}
        yAxisLabel={yAxisLabel}
        yAxisFormatter={
          isWaterRegionSelected ? formatAxisNumber : formatPopulation
        }
        yAxisColor={isWaterRegionSelected ? yAxisLabelColor : undefined}
        labelFormatter={formatLabel}
      />
    </>
  );
}

export default connect((state: StateTree, passedProps: PassedProps) => ({
  getWorldRegionName: getNameForWorldRegionId(state),
  thresholds: getThresholdsForDataType(state, passedProps.selectedDataType),
}))(responsive(FutureLineChart));
