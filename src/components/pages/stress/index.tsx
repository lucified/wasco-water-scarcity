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
              <em>
                Placeholder for information about water stress. Placeholder for
                information about water stress. Placeholder for information
                about water stress. Placeholder for information about water
                stress.
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
