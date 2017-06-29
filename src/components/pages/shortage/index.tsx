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
          <div className="col-xs-12 col-md-6 col-lg-8">
            <p>
              <b>Blue water shortage</b> is a form of scarcity that occurs when
              a population's water needs cannot be met using locally available
              water. Water needs are complex. Products (and "virtual" water) can
              be imported (even <Link to="/drinking-water">
                drinking water
              </Link>), leading to{' '}
              <Link to="/virtual-water-dependency/shortage">
                virtual water dependency
              </Link>. In addition to water from rivers, lakes, and aquifers,
              rainfall and soil moisture (
              <Link to="/green-water">"green water"</Link>) may satisfy needs.
              And even if water is available locally, it may be{' '}
              <Link to="/upstream-dependency/shortage">
                dependent on upstream water use
              </Link>.{' '}
            </p>
            <p>
              Evaluating the volume of water available per person highlights
              potential blue water shortage hotspots, before addressing these
              more detailed issues or focussing on specific impacts, e.g.
              related to <Link to="/food-security">food security</Link> or{' '}
              <Link to="/water-supply">urban water supply systems</Link>.
              Thresholds for low, moderate and high shortage are commonly used,
              but are only indicative.
            </p>
            {/* TODO: Make this its own component and use actual values */}
            <p>
              These estimates of blue water shortage are produced using{' '}
              <span className={styles.assumption}>
                blue water availability
              </span>{' '}
              estimates from the water model{' '}
              <span className={styles.assumption}>'watergap'</span>, driven by
              climate data from{' '}
              <span className={styles.assumption}>'WATCH'</span>, calculated for{' '}
              <span className={styles.assumption}>
                food production units
              </span>{' '}
              at a <span className={styles.assumption}>decadal</span> timescale.
              Population estimates are from{' '}
              <span className={styles.assumption}>HYDE</span>.{' '}
              <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
            </p>
          </div>
          <div className="col-xs-12 col-md-6 col-lg-4">
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
