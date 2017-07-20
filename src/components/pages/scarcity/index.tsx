import * as classNames from 'classnames';
import * as React from 'react';

import withPageData, { Props } from '../with-page-data';

import CrossReferences from '../../cross-references';
import DataTypeSelector from '../../data-type-selector';
import GapMinder from '../../gapminder';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import ModelSelector from '../../model-selector';
import SelectedRegionInformation from '../../selected-region-information';
import ThresholdSelector from '../../threshold-selector';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';
import YearLabel from '../../year-label';
import Description from './description';
import MoreInformation from './more-information';

import * as styles from './index.scss';

class ScarcityBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1 className={styles['section-header']}>
          Blue Water Scarcity: stress and shortage
        </h1>
        <div className="row between-xs">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <Description />
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-4', styles['body-text'])}
          >
            <ModelSelector
              className={styles['secondary-content']}
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
                    <DataTypeSelector />
                  </div>
                </div>
              </div>
              <div className="row middle-xs">
                <div
                  className={classNames(
                    'col-xs-12',
                    'col-md-6',
                    'col-lg-8',
                    styles.map,
                  )}
                >
                  <YearLabel
                    className={styles['year-label']}
                    startYear={selectedWaterData.startYear}
                    endYear={selectedWaterData.endYear}
                  />
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
                <SelectedRegionInformation />
              </div>
              <div className="row">
                <div
                  className={classNames(
                    'col-xs-12',
                    'col-md-6',
                    styles['body-text'],
                  )}
                >
                  <MoreInformation />
                </div>
              </div>
            </div>}
        <div className="row">
          <CrossReferences fromPage="scarcity" />
        </div>
      </div>
    );
  }
}

export default withPageData(ScarcityBody, 'scarcity');
