import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { scarcitySelector, WaterRegionGeoJSON } from '../data';
import { StateTree } from '../reducers';
import {
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
  isZoomedIn?: boolean;
}

interface PassedProps {
  selectedDataType: HistoricalDataType;
}

export type Props = PassedProps & GeneratedMapProps;

export default function withMapData<T extends PassedProps>(
  Component: React.ComponentType<T>,
) {
  // This typing is actually incorrect but works because GenerateMapProps are all optional.
  // The third type should be Omit<T, keyof GeneratedMapProps> or something.
  return connect<GeneratedMapProps, {}, T, StateTree>(
    (state, { selectedDataType }) => {
      const selectedData = getSelectedStressShortageData(state);
      const selector =
        selectedDataType === 'scarcity'
          ? scarcitySelector(
              getThresholdsForDataType(state, 'scarcity'),
              getThresholdsForDataType(state, 'stress'),
              getThresholdsForDataType(state, 'shortage'),
            )
          : (d: StressShortageDatum) => d[selectedDataType];
      const dataForComponent = selectedData && {
        ...selectedData,
        data: mapValues(selectedData.data, d => selector(d)),
      };
      return {
        selectedWaterData: dataForComponent,
        waterRegions: getWaterRegionData(state),
        isZoomedIn: isZoomedInToRegion(state),
      };
    },
  )(Component as any); // TODO: Fix typings
}
