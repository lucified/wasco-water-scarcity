import * as classNames from 'classnames';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

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
import Description from './description';

import * as styles from './index.scss';

interface PassedProps extends RouteComponentProps<void> {
  setSelectedDataType: (dataType: DataType) => void;
  selectedWaterData?: TimeAggregate<StressShortageDatum>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps;

class ScarcityBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1>Blue Water Scarcity: stress and shortage</h1>
        <div className="row">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <Description />
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <ModelSelector
              estimateLabel="stress and shortage"
              includeConsumption
            />
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
                    The separate drivers of <Link to="/stress">stress</Link> and{' '}
                    <Link to="/shortage">shortage</Link> can be explored on
                    their own pages. You can also{' '}
                    <Link to="/future/scarcity">
                      explore how stress and shortage can be addressed in future
                    </Link>.
                  </p>
                </div>
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
