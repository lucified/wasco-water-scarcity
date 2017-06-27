import * as React from 'react';

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

interface PassedProps {
  setSelectedDataType: (dataType: DataType) => void;
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps;

class ShortageBody extends React.Component<Props, void> {
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
              <em>
                <b>Blue water shortage</b> is a form of scarcity that occurs
                when a population's water needs cannot be met using locally
                available water. Water needs are complex. Products (and
                "virtual" water) can be imported (even{' '}
                <a href="/drinking_water">drinking water</a>), leading to{' '}
                <a href="/virtual_water_dependency/shortage">
                  virtual water dependency
                </a>. In addition to water from rivers, lakes, and aquifers,
                rainfall and soil moisture (
                <a href="/green_water">
                  "green water"
                </a>)
                may satisfy needs. And even if water is available locally, it
                may be{' '}
                <a href="/upstream_dependency/shortage">
                  dependent on upstream water use
                </a>.{' '}
              </em>
            </p>
            <p>
              <em>
                Evaluating the volume of water available per person highlights
                potential blue water shortage hotspots, before addressing these
                more detailed issues or focussing on specific impacts, e.g.
                related to <a href="/food_security">food security</a> or{' '}
                <a href="/water_supply">urban water supply systems</a>.
                Thresholds for low, moderate and high shortage are commonly
                used, but are only indicative.
              </em>
            </p>
            {/* This could become a stand-alone component, rather than making this component dependent on all these props?*/}
            <p>
              <em>
                These estimates of blue water shortage are produced using{' '}
                <span className={styles.assumption}>
                  blue water availability
                </span>{' '}
                estimates from the water model{' '}
                <span className={styles.assumption}>'watergap'</span>, driven by
                climate data from{' '}
                <span className={styles.assumption}>'WATCH'</span>, calculated
                for{' '}
                <span className={styles.assumption}>
                  food production units
                </span>{' '}
                at a <span className={styles.assumption}>decadal</span>{' '}
                timescale. Population estimates are from{' '}
                <span className={styles.assumption}>HYDE</span>.{' '}
                <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
              </em>
            </p>
          </div>
          <div className="col-xs-12 col-md-6 col-lg-4">
            <ModelSelector />
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
                    <em>
                      Water shortage is considered population-driven scarcity.
                      Water needs are in question rather than water use more
                      generally. To calculate water availability, upstream
                      withdrawals need to be taken into account (also see{' '}
                      <a href="/upstream_dependency/stress">
                        upstream dependency
                      </a>). In these results, we allocated more water to
                      regions with high river flows (discharge) (<a href="#">
                        Read
                        more
                      </a>). To focus on{' '}
                      <a href="/sustainability">sustainability</a>, availability
                      typically only considers renewable freshwater, not{' '}
                      <a href="/fossil_groundwater">fossil groundwater</a>.{' '}
                      <a href="/interbasin_water_transfers">
                        Interbasin water transfers
                      </a>{' '}
                      are usually also analysed separately.{' '}
                      <a href="/green_water">"Green water"</a> (rainfall and
                      soil moisture) and{' '}
                      <a href="/virtual_water_dependency/shortage">
                        "virtual water"
                      </a>{' '}
                      (importing water-using products) can also increase the
                      effective availability of water.
                      These other sources of water could potentially decrease
                      water shortage, but bring with them other side-effects.
                    </em>
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
