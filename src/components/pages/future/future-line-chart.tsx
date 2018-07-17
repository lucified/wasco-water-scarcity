import * as React from 'react';
import styled from 'styled-components';
import { createSelector } from '../../../../node_modules/reselect';
import {
  ComparisonVariables,
  FutureEnsembleData,
  FutureScenario,
  isFutureScenarioInComparisonVariables,
  isScenarioEqual,
} from '../../../data';
import { FutureDataType } from '../../../types';
import { CanvasLineChart } from '../../generic/canvas-line-chart';
import responsive from '../../generic/responsive';
import { theme } from '../../theme';

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 243px;
  font-weight: 200;
  font-family: ${theme.labelFontFamily};
  color: ${theme.colors.gray};
`;

interface PassedProps {
  selectedTimeIndex: number;
  selectedDataType: FutureDataType;
  selectedWaterRegionId?: number;
  selectedWorldRegionId?: number;
  selectedScenario: FutureScenario;
  ensembleData: FutureEnsembleData;
  comparisonVariables: ComparisonVariables;
  onTimeIndexChange: (value: number) => void;
  width?: number;
  height?: number;
}

type Props = PassedProps;

// Remember that we only have one globally created memoized selector which won't
// work if we ever decide to add a second future line chart
const getComparisonSeries = createSelector(
  (props: Props) => props.ensembleData,
  (props: Props) => props.comparisonVariables,
  (data, comparisonVariables) => {
    const scenarioFilter = isFutureScenarioInComparisonVariables(
      comparisonVariables,
    );
    return data.filter(scenarioFilter).map(series => ({
      id: series.scenarioId,
      color: theme.colors.gray,
      points: series.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    }));
  },
);

// Remember that we only have one globally created memoized selector which won't
// work if we ever decide to add a second future line chart
const getSelectedSeries = createSelector(
  (props: Props) => props.ensembleData,
  (props: Props) => props.selectedScenario,
  (data, selectedScenario) => {
    const datum = data.find(d => isScenarioEqual(selectedScenario, d));
    if (!datum) {
      console.error('Unable to find selected scenario from ensemble');
      return undefined;
    }
    return {
      id: datum.scenarioId,
      color: theme.colors.blueAalto,
      points: datum.data.map(d => ({
        value: d.value,
        time: new Date((d.y0 + d.y1) / 2, 0),
      })),
    };
  },
);

function FutureLineChart(props: Props) {
  const { selectedWaterRegionId, selectedWorldRegionId, width, height } = props;
  if (selectedWaterRegionId == null && selectedWorldRegionId == null) {
    return <Empty>Select an area on the map</Empty>;
  }

  const comparisonSeries = getComparisonSeries(props);
  const selectedSeries = getSelectedSeries(props);

  // const thresholdColors =
  //   selectedDataType === 'shortage'
  //     ? ['none', ...getDataTypeColors('shortage')].reverse()
  //     : ['none', ...getDataTypeColors('stress')];

  return (
    <CanvasLineChart
      series={comparisonSeries}
      selectedSeries={selectedSeries}
      width={width || 600}
      height={height || 240}
    />
  );
}

export default responsive(FutureLineChart);
