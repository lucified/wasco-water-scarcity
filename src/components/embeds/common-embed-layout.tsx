import * as React from 'react';
import styled from 'styled-components';
import { HistoricalDataType } from '../../types';
import responsive, { ResponsiveProps } from '../generic/responsive';
import Spinner from '../generic/spinner';
import SimpleMap from '../simple-map';
import TimeSelector from '../time-selector';
import withMapData, { MapProps } from '../with-map-data';
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
  dataType: HistoricalDataType;
  autoplay: boolean;
}

type Props = MapProps & ResponsiveProps & PassedProps;

class CommonEmbedLayout extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType(this.props.dataType);
  }

  public render() {
    const { selectedWaterData, waterRegions, width, autoplay } = this.props;

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
                <TimeSelector showPlayButton autoplay={autoplay} />
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
