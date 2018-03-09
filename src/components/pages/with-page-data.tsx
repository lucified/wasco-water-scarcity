import mapValues = require('lodash/mapValues');
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { setSelectedDataType } from '../../actions';
import { scarcitySelector, WaterRegionGeoJSON } from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedDataType,
  getSelectedStressShortageData,
  getThresholdsForDataType,
  getWaterRegionData,
} from '../../selectors';
import { DataType, StressShortageDatum, TimeAggregate } from '../../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

interface GeneratedStateProps {
  selectedWaterData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type PassedProps = RouteComponentProps<{}>;

export type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

export default function withPageData(
  Component: React.ComponentType<Props>,
  // Force the dataType for certain pages, otherwise use the data type from the Redux state.
  componentDataType?: DataType,
) {
  return connect<
    GeneratedStateProps,
    GeneratedDispatchProps,
    PassedProps,
    StateTree
  >(
    state => {
      const dataType = componentDataType || getSelectedDataType(state);
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
        setSelectedDataType: (newDataType: DataType) => {
          dispatch(setSelectedDataType(newDataType));
        },
      };
    },
  )(Component);
}
