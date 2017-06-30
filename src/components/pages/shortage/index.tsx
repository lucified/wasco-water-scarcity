import * as classNames from 'classnames';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import { WaterRegionGeoJSON } from '../../../data/types';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';
import withPageData from '../with-page-data';

import CrossReferences from '../../cross-references';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import ModelSelector from '../../model-selector';
import SelectedRegionInformation from '../../selected-region-information';
import ThresholdSelector from '../../threshold-selector';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';
import Description from './description';

import * as styles from './index.scss';

interface PassedProps extends RouteComponentProps<void> {
  setSelectedDataType: (dataType: DataType) => void;
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps;

class ShortageBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('shortage');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1>Water Shortage</h1>
        <div className="row">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <Description />
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <ModelSelector />
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
                <div className="col-xs-12 col-md-8">
                  <TimeSelector />
                </div>
                <div className="col-xs-12 col-md-4">
                  <ThresholdSelector dataType="shortage" />
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
                <div
                  className={classNames(
                    'col-xs-12',
                    'col-md-6',
                    'col-lg-8',
                    styles['body-text'],
                  )}
                >
                  <p>
                    Water shortage is considered population-driven scarcity.
                    Water needs are in question rather than water use more
                    generally. To calculate water availability, upstream
                    withdrawals need to be taken into account (also see{' '}
                    <Link to="/upstream-dependency/stress">
                      upstream dependency
                    </Link>). In these results, we allocated more water to
                    regions with high river flows (discharge) (
                    <a href="#">Read more </a>). To focus on{' '}
                    <Link to="/sustainability">sustainability</Link>,
                    availability typically only considers renewable freshwater,
                    not <Link to="/fossil-groundwater">
                      fossil groundwater
                    </Link>.{' '}
                    <Link to="/interbasin-water-transfers">
                      Interbasin water transfers
                    </Link>{' '}
                    are usually also analysed separately.{' '}
                    <Link to="/green-water">"Green water"</Link> (rainfall and
                    soil moisture) and{' '}
                    <Link to="/virtual-water-dependency/shortage">
                      "virtual water"
                    </Link>{' '}
                    (importing water-using products) can also increase the
                    effective availability of water. These other sources of
                    water could potentially decrease water shortage, but bring
                    with them other side-effects.
                  </p>
                </div>
              </div>
              <div className="row">
                <SelectedRegionInformation dataType="shortage" />
              </div>
            </div>}
        <div className="row">
          <CrossReferences fromPage="shortage" />
        </div>
      </div>
    );
  }
}

export default withPageData(ShortageBody);
