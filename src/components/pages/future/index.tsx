import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { WaterRegionGeoJSON } from '../../../data/types';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';
import withPageData from '../with-page-data';

import CrossReferences from '../../cross-references';
import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';

import * as styles from './index.scss';

interface PassedProps extends RouteComponentProps<void> {
  setSelectedDataType: (dataType: DataType) => void;
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps;

class ScarcityBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <div className="row">
          <div
            className={classNames(
              'col-xs-12',
              'col-md-6',
              'col-lg-8',
              styles['body-text'],
            )}
          >
            <h1>The Future?</h1>
            <p>
              <em>What can we do about this in the future?</em>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <FutureLineChart />
          </div>
        </div>
        {!selectedWaterData || !waterRegions
          ? <div className="row middle-xs">
              <div className="col-xs-12">
                <Spinner />
              </div>
            </div>
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
                  <div>Futures</div>
                </div>
              </div>
              <div className="row">
                <WorldRegionSelector />
              </div>
              <div className="row">
                <SelectedRegionInformation />
              </div>
            </div>}
        <div className="row">
          <CrossReferences fromPage="future" />
        </div>
      </div>
    );
  }
}

export default withPageData(ScarcityBody);
