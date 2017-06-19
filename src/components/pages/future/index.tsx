import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions';
import { WaterRegionGeoJSON } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedStressShortageData,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';

import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

interface GeneratedStateProps {
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

class ScarcityBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h1>The Future?</h1>
            <p><em>What can we do about this in the future?</em></p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Actions</h2>
            <p><em>Placeholder for actions</em></p>
          </div>
        </div>
        {!selectedWaterData || !waterRegions
          ? <Spinner />
          : <div>
              <div className="row middle-xs">
                <div className="col-xs-12 col-md-6 col-lg-8">
                  <TimeSelector />
                  <Map
                    width={800}
                    selectedData={selectedWaterData}
                    waterRegions={waterRegions}
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-lg-4">
                  <DataSelector />
                  <div>
                    Futures
                  </div>
                </div>
              </div>
              <div className="row">
                <WorldRegionSelector />
              </div>
              <div className="row">
                <SelectedRegionInformation />
              </div>
            </div>}
      </div>
    );
  }
}

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

export default connect<GeneratedStateProps, GeneratedDispatchProps, undefined>(
  mapStateToProps,
  mapDispatchToProps,
)(ScarcityBody);
