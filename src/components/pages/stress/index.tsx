import * as React from 'react';
import { Link } from 'react-router-dom';

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

class StressBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1>Water Stress</h1>
        <div className="row">
          <div className="col-xs-12 col-md-6 col-lg-8">
            <p>
              <b>Blue water stress</b> is a form of scarcity that occurs when
              a large share of water in rivers, lakes and aquifers is taken
              for human use. Water becomes scarce because increasing water use
              makes it difficult to satisfy various competing human and
              environmental needs.{' '}
              <Link to="/low-water">
                Low water levels
              </Link>{' '}
              from increasing use can impact on{' '}
              <Link to="/navigation">navigation</Link>,{' '}
              <Link to="/environmental-flow">environmental water needs</Link>,
              and <Link to="/access-to-water">access to water</Link>. Comparing
              use to availability helps highlight potential blue water stress
              hotspots before focussing on specific impacts. Thresholds for
              low, moderate and high stress are commonly used, but are only
              indicative.
            </p>
            {/* This could become a stand-alone component, rather than
                making this component dependent on all these props?*/}
            <p>
              These estimates of blue water stress are produced using{' '}
              <span className={styles.assumption}>
                blue water availability
              </span>{' '}
              and <span className={styles.assumption}>consumption</span>{' '}
              estimates from the water model{' '}
              <span className={styles.assumption}>'watergap'</span>, driven by
              climate data from{' '}
              <span className={styles.assumption}>'WATCH'</span>
              , calculated for{' '}
              <span className={styles.assumption}>
                food production units
              </span>{' '}
              at a <span className={styles.assumption}>decadal</span>{' '}
              timescale. <a href="#">Read more</a>.{' '}
              <Link to="/stress/uncertainty">Explore alternatives</Link>.
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
                  <ThresholdSelector dataType="stress" />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <Map
                    width={1200}
                    selectedData={selectedWaterData}
                    waterRegions={waterRegions}
                  />
                  <WorldRegionSelector />
                  <p>
                    Water stress is considered demand-driven scarcity. It can
                    occur even with a small population if water use is
                    sufficiently high and water availability sufficiently low.
                    Irrigation is the largest water user globally, and in most
                    regions, which links water stress to{' '}
                    <Link to="/food-security">food security</Link>.
                  </p>
                  <p>
                    To calculate water availability, upstream withdrawals need
                    to be taken into account (also see{' '}
                    <Link to="/upstream-dependency/stress">
                      upstream dependency
                    </Link>). In these results, we allocated more water to
                    regions with high river flows (discharge) (
                    <a href="#">Read more </a>). To focus on{' '}
                    <Link to="/sustainability">sustainability</Link>,
                    availability typically only considers renewable
                    freshwater, not{' '}
                    <Link to="/fossil-groundwater">fossil groundwater</Link>.{' '}
                    <Link to="/interbasin-water-transfers">
                      Interbasin water transfers
                    </Link>{' '}
                    are usually also analysed separately. This explains why
                    water use can be higher than availability.
                  </p>
                </div>
              </div>
              <div className="row">
                <SelectedRegionInformation dataType="stress" />
              </div>
            </div>}
        <div className="row">
          <CrossReferences fromPage="stress" />
        </div>
      </div>
    );
  }
}

export default withPageData(StressBody);
