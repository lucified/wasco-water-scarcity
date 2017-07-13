import mapValues = require('lodash/mapValues');
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../actions/index';
import { WaterRegionGeoJSON } from '../../data/types';
import { StateTree } from '../../reducers';
import {
  getSelectedStressShortageData,
  getThresholdsForDataType,
  getWaterRegionData,
} from '../../selectors';
import {
  DataType,
  scarcitySelector,
  StressShortageDatum,
  TimeAggregate,
} from '../../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

interface GeneratedStateProps {
  selectedWaterData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type PassedProps = RouteComponentProps<void>;

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

export default function withPageData(
  Component: React.ComponentClass<Props>,
  dataType: DataType,
) {
  return connect<GeneratedStateProps, GeneratedDispatchProps, PassedProps>(
    (state: StateTree): GeneratedStateProps => {
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
        data: mapValues<StressShortageDatum, number>(selectedData.data, d =>
          selector(d),
        ),
      };
      return {
        selectedWaterData: dataForComponent,
        waterRegions: getWaterRegionData(state),
      };
    },
    (dispatch: Dispatch<any>): GeneratedDispatchProps => {
      return {
        setSelectedDataType: (newDataType: DataType) => {
          dispatch(setSelectedDataType(newDataType));
        },
      };
    },
  )(Component);
}
