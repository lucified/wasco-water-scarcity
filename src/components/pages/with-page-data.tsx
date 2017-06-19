import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../actions/index';
import { WaterRegionGeoJSON } from '../../data/types';
import { StateTree } from '../../reducers';
import {
  getSelectedStressShortageData,
  getWaterRegionData,
} from '../../selectors';
import { DataType, StressShortageDatum, TimeAggregate } from '../../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

interface GeneratedStateProps {
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedWaterData: getSelectedStressShortageData(state),
    waterRegions: getWaterRegionData(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
  };
}

export default function withPageData(Component: React.ComponentClass<Props>) {
  return connect<GeneratedStateProps, GeneratedDispatchProps, undefined>(
    mapStateToProps,
    mapDispatchToProps,
  )(Component);
}
