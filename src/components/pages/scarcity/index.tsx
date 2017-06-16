import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions/index';
import { DataType } from '../../../types';
import DataSelector from '../../data-selector';
import GapMinder from '../../gapminder';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import ThresholdSelector from '../../threshold-selector';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';

import * as styles from './index.scss';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

type Props = GeneratedDispatchProps;

class ScarcityBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h1>Water Scarcity</h1>
            <p><em>Placeholder for information about water scarcity</em></p>
          </div>
        </div>
        <div className="row middle-xs">
          <div className="col-xs-12 col-md-8">
            <TimeSelector />
          </div>
          <div className="col-xs-12 col-md-4">
            <div className={styles.selectors}>
              <ThresholdSelector
                className={styles['threshold-selector']}
                dataType="stress"
              />
              <ThresholdSelector
                className={styles['threshold-selector']}
                dataType="shortage"
              />
              <DataSelector />
            </div>
          </div>
        </div>
        <div className="row middle-xs">
          <div className="col-xs-12 col-md-6 col-lg-8">
            <Map width={800} />
          </div>
          <div className="col-xs-12 col-md-6 col-lg-4">
            <GapMinder />
          </div>
        </div>
        <div className="row">
          <WorldRegionSelector />
        </div>
        <div className="row">
          <SelectedRegionInformation />
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
)(ScarcityBody);
