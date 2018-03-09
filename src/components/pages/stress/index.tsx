import * as classNames from 'classnames';
import * as React from 'react';

import withPageData, { Props } from '../with-page-data';

import CrossReferences from '../../cross-references';
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

class StressBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <h1 className={styles['section-header']}>Water Stress</h1>
        <div className="row between-xs">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <Description />
          </div>
          <div className={classNames('col-xs-12', 'col-md-4')}>
            <ModelSelector
              className={styles['secondary-content']}
              estimateLabel="stress"
              includeConsumption
            />
          </div>
        </div>
        {!selectedWaterData || !waterRegions ? (
          <div className="row middle-xs">
            <div className="col-xs-12">
              <Spinner />
            </div>
          </div>
        ) : (
          <div>
            <div className="row middle-xs">
              <div className="col-xs-12 col-md-8">
                <TimeSelector />
              </div>
              <div className="col-xs-12 col-md-4">
                <ThresholdSelector dataType="stress" />
              </div>
            </div>
            <div className="row">
              <div className={classNames(styles.map, 'col-xs-12')}>
                <YearLabel
                  className={styles['year-label']}
                  startYear={selectedWaterData.startYear}
                  endYear={selectedWaterData.endYear}
                />
                <Map
                  width={1200}
                  selectedData={selectedWaterData}
                  waterRegions={waterRegions}
                />
                <WorldRegionSelector />
              </div>
            </div>
            <div className="row">
              <SelectedRegionInformation dataType="stress" />
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
          </div>
        )}
        <div className="row">
          <CrossReferences fromPage="stress" />
        </div>
      </div>
    );
  }
}

export default withPageData(StressBody, 'stress');
