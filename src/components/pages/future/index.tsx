import * as React from 'react';

import { WaterRegionGeoJSON } from '../../../data/types';
import { DataType, StressShortageDatum, TimeAggregate } from '../../../types';
import withPageData from '../with-page-data';

import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import SelectedRegionInformation from '../../selected-region-information';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';

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
        <div className="row">
          <div className="col-xs-12">
            <h1>The Future?</h1>
            <p><em>What can we do about this in the future?</em></p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Actions</h2>
            <p><em>Placeholder for actions</em></p>
          </div>
        </div>
        {!selectedWaterData || !waterRegions
          ? <Spinner />
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
                  <div>
                    Futures
                  </div>
                </div>
              </div>
              <div className="row">
                <WorldRegionSelector />
              </div>
              <div className="row">
                <SelectedRegionInformation />
              </div>
            </div>}
      </div>
    );
  }
}

export default withPageData(ScarcityBody);
