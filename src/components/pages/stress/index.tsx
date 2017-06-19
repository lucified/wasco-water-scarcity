import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions/index';
import { WaterRegionGeoJSON } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedStressShortageData,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';

import Spinner from '../../generic/spinner';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import ThresholdSelector from '../../threshold-selector';
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

class StressBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h1>Water Stress</h1>
            <p><em>Placeholder for information about water stress</em></p>
          </div>
        </div>
        {!selectedWaterData || !waterRegions
          ? <Spinner />
          : <div>
              <div className="row middle-xs">
                <div className="col-xs-12 col-md-8">
                  <TimeSelector />
                </div>
                <div className="col-xs-12 col-md-4">
                  <ThresholdSelector dataType="stress" />
                </div>
              </div>
              <div className="row middle-xs">
                <div className="col-xs-12">
                  <Map
                    width={1200}
                    selectedData={selectedWaterData}
                    waterRegions={waterRegions}
                  />
                  <WorldRegionSelector />
                </div>
              </div>
              <div className="row">
                <SelectedRegionInformation dataType="stress" />
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
)(StressBody);
