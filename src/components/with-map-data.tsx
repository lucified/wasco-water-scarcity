import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { setSelectedHistoricalDataType } from '../actions';
import { scarcitySelector, WaterRegionGeoJSON } from '../data';
import { StateTree } from '../reducers';
import {
  getSelectedHistoricalDataType,
  getSelectedStressShortageData,
  getThresholdsForDataType,
  getWaterRegionData,
} from '../selectors';
import {
  HistoricalDataType,
  StressShortageDatum,
  TimeAggregate,
} from '../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: HistoricalDataType) => void;
}

interface GeneratedStateProps {
  selectedWaterData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

export type Props = GeneratedDispatchProps & GeneratedStateProps;

export default function withMapData<T extends Props>(
  Component: React.ComponentType<T>,
  // Force the dataType for certain pages, otherwise use the data type from the Redux state.
  componentDataType?: HistoricalDataType,
) {
  return connect<GeneratedStateProps, GeneratedDispatchProps, {}, StateTree>(
    state => {
      const dataType =
        componentDataType || getSelectedHistoricalDataType(state);
      const selectedData = getSelectedStressShortageData(state);
      const selector =
        dataType === 'scarcity'
          ? scarcitySelector(
              getThresholdsForDataType(state, 'scarcity'),
              getThresholdsForDataType(state, 'stress'),
              getThresholdsForDataType(state, 'shortage'),
            )
          : (d: StressShortageDatum) => d[dataType];
      const dataForComponent = selectedData && {
        ...selectedData,
        data: mapValues(selectedData.data, d => selector(d)),
      };
      return {
        selectedWaterData: dataForComponent,
        waterRegions: getWaterRegionData(state),
      };
    },
    dispatch => {
      return {
        setSelectedDataType: (newDataType: HistoricalDataType) => {
          dispatch(setSelectedHistoricalDataType(newDataType));
        },
      };
    },
  )(Component);
}
