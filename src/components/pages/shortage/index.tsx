import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions/index';
import { DataType } from '../../../types';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import ThresholdSelector from '../../threshold-selector';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

type Props = GeneratedDispatchProps;

class ShortageBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('shortage');
  }

  public render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h1>Water Shortage</h1>
            <p><em>Placeholder for information about water shortage</em></p>
          </div>
        </div>
        <div className="row middle-xs">
          <div className="col-xs-12 col-md-8">
            <TimeSelector />
          </div>
          <div className="col-xs-12 col-md-4">
            <ThresholdSelector dataType="shortage" />
          </div>
        </div>
        <div className="row middle-xs">
          <div className="col-xs-12">
            <Map width={1200} />
            <WorldRegionSelector />
          </div>
        </div>
        <div className="row">
          <SelectedRegionInformation dataType="shortage" />
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
  };
}

export default connect<{}, GeneratedDispatchProps, undefined>(
  () => ({}),
  mapDispatchToProps,
)(ShortageBody);
