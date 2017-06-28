import * as React from 'react';
import { Link } from 'react-router-dom';

import { WaterRegionGeoJSON } from '../../../data/types';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';
import withPageData from '../with-page-data';

import CrossReferences from '../../cross-references';
import DataSelector from '../../data-selector';
import GapMinder from '../../gapminder';
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

class ScarcityBody extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1>Blue Water Scarcity: stress and shortage</h1>
        <div className="row">
          <div className="col-xs-12 col-md-6 col-lg-8">
            <p>
              Blue water scarcity is an umbrella concept for situations where
              there is not enough water in rivers, lakes and aquifers to meet
              all uses. Scarce water is shared among the uses by either{' '}
              <Link to="/conflict_cooperation">
                competition or cooperation
              </Link>.
              Negative impacts are seen when a use does not have access to
              enough water. From a human perspective, two main categories of
              impacts are:
            </p>
            <p>
              <b><Link to="/stress">Water stress</Link></b>: a large share of
              available water is used by humans, such that it becomes
              increasingly difficult to satisfy various competing human and
              environmental needs. This is demand-driven scarcity.
            </p>
            <p>
              <b><Link to="/shortage">Water shortage</Link></b>: a population's
              water needs cannot be met using locally available water. This is
              population-driven scarcity.
            </p>
            <p>
              Both concepts are explored in more detail on their own pages,
              but it is also useful to see where stress and shortage occur by
              themselves or together. If stress occurs, high demand is causing
              impacts. If shortage occurs, needs cannot be met with current
              availability. If both occur, a region is facing the need to both
              reduce impacts from their current use, and to find other means
              of meeting their needs.
            </p>
            {/* This could become a stand-alone component, rather than making
                this component dependent on all these props?*/}
            <p>
              These estimates of blue water stress and shortage are produced
              using{' '}
              <span className={styles.assumption}>
                blue water availability
              </span>{' '}
              and <span className={styles.assumption}>consumption</span>{' '}
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
              <a href="#">Read more</a>.{' '}
              <a href="#">Explore alternatives</a>.
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
                  <Map
                    width={800}
                    selectedData={selectedWaterData}
                    waterRegions={waterRegions}
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-lg-4">
                  <GapMinder />
                </div>
              </div>
              <div className="row">
                <WorldRegionSelector />
                <p>
                  The separate drivers of <Link to="/stress">stress</Link> and{' '}
                  <Link to="/shortage">shortage</Link> can be explored on their
                  own pages. You can also{' '}
                  <Link to="/future/scarcity">
                    explore how stress and shortage can be addressed in future
                  </Link>.
                </p>
              </div>
              <div className="row">
                <SelectedRegionInformation />
              </div>
            </div>}
        <div className="row">
          <CrossReferences fromPage="scarcity" />
        </div>
      </div>
    );
  }
}

export default withPageData(ScarcityBody);
