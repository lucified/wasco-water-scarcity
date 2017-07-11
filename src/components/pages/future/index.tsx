import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions';
import { WaterRegionGeoJSON } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedFutureStressShortageData,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';

import CrossReferences from '../../cross-references';
import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';

import * as styles from './index.scss';

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

interface GeneratedStateProps {
  selectedFutureWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps & GeneratedStateProps & GeneratedDispatchProps;

class FutureBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedFutureWaterData, waterRegions } = this.props;

    return (
      <div>
        <div className="row between-xs">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <h1>The Future?</h1>
            <p>
              <em>What can we do about this in the future?</em>
            </p>
          </div>
        </div>
        {!selectedFutureWaterData || !waterRegions
          ? <div className="row middle-xs">
              <div className="col-xs-12">
                <Spinner />
              </div>
            </div>
          : <div>
              <div className="row">
                <div className="col-xs-12 col-md-6 col-lg-8">
                  <Map
                    width={800}
                    selectedData={selectedFutureWaterData}
                    waterRegions={waterRegions}
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-lg-4">
                  <DataSelector hideScarcity />
                  <FutureLineChart />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <WorldRegionSelector />
                </div>
              </div>
            </div>}
        <div className="row">
          <div className="col-xs-12">
            <CrossReferences fromPage="future" />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedFutureWaterData: getSelectedFutureStressShortageData(state),
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

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureBody);
