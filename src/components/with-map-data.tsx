import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { scarcitySelector, WaterRegionGeoJSON } from '../data';
import { StateTree } from '../reducers';
import {
  getHistoricalScenarioId,
  getSelectedStressShortageData,
  getThresholdsForDataType,
  getWaterRegionData,
  isZoomedInToRegion,
} from '../selectors';
import {
  HistoricalDataType,
  StressShortageDatum,
  TimeAggregate,
} from '../types';

export interface GeneratedMapProps {
  selectedWaterData?: TimeAggregate<number | undefined>;
  waterRegions?: WaterRegionGeoJSON;
  isZoomedIn: boolean;
  scenarioId: string;
}

interface PassedProps {
  selectedDataType: HistoricalDataType;
}

export type Props = PassedProps & GeneratedMapProps;

export default function withMapData<T extends Props>(
  Component: React.ComponentType<T>,
) {
  // TODO: fix any below. This now loses type information to consumers of the HOC
  // Should be Omit<T, keyof GeneratedStateProps> or something similar.
  return connect<GeneratedMapProps, {}, any, StateTree>(
    (state, { selectedDataType }) => {
      const selectedData = getSelectedStressShortageData(state);
      const selector =
        selectedDataType === 'scarcity'
          ? scarcitySelector(
              getThresholdsForDataType(state, 'scarcity'),
              getThresholdsForDataType(state, 'stress'),
              getThresholdsForDataType(state, 'shortage'),
            )
          : (d: StressShortageDatum) => (d as any)[selectedDataType]; // TODO: fix typings
      const dataForComponent = selectedData && {
        ...selectedData,
        data: mapValues(selectedData.data, d => selector(d)),
      };
      return {
        selectedWaterData: dataForComponent,
        waterRegions: getWaterRegionData(state),
        isZoomedIn: isZoomedInToRegion(state),
        scenarioId: getHistoricalScenarioId(state),
      };
    },
  )(Component as any); // TODO: Fix typings
}
