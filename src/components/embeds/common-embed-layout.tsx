import * as React from 'react';
import styled from 'styled-components';
import { HistoricalDataType } from '../../types';
import responsive, { ResponsiveProps } from '../generic/responsive';
import Spinner from '../generic/spinner';
import SimpleMap from '../simple-map';
import TimeSelector from '../time-selector';
import withMapData, { GeneratedMapProps } from '../with-map-data';
import WorldRegionSelector from '../world-region-selector';
import YearLabel from '../year-label';

const MapContainer = styled.div`
  position: relative;
`;

const StyledYearLabel = styled(YearLabel)`
  position: absolute;
  right: 0;
`;

interface PassedProps {
  selectedDataType: HistoricalDataType;
  autoplay: boolean;
}

type Props = GeneratedMapProps & ResponsiveProps & PassedProps;

class CommonEmbedLayout extends React.Component<Props> {
  public render() {
    const {
      selectedWaterData,
      waterRegions,
      width,
      selectedDataType,
      autoplay,
    } = this.props;

    return (
      <div>
        {!selectedWaterData || !waterRegions ? (
          <div className="row middle-xs">
            <div className="col-xs-12">
              <Spinner />
            </div>
          </div>
        ) : (
          <div>
            <div className="row middle-xs">
              <div className="col-xs-12">
                <TimeSelector
                  dataType={selectedDataType}
                  showPlayButton
                  autoplay={autoplay}
                />
              </div>
            </div>
            <div className="row">
              <MapContainer className="col-xs-12">
                <StyledYearLabel
                  startYear={selectedWaterData.startYear}
                  endYear={selectedWaterData.endYear}
                />
                <SimpleMap
                  width={width}
                  selectedDataType={selectedDataType}
                  selectedData={selectedWaterData}
                  waterRegions={waterRegions}
                />
                <WorldRegionSelector />
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withMapData(responsive(CommonEmbedLayout));
