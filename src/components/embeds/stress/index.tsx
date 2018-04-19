import * as React from 'react';
import styled from 'styled-components';
import responsive, { ResponsiveProps } from '../../generic/responsive';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import withPageData, {
  Props as PageDataProps,
} from '../../pages/with-page-data';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';
import YearLabel from '../../year-label';

const MapContainer = styled.div`
  position: relative;
`;

const StyledYearLabel = styled(YearLabel)`
  position: absolute;
  right: 0;
`;

type Props = PageDataProps & ResponsiveProps;

class StressEmbedPlain extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions, width } = this.props;

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
                <TimeSelector />
              </div>
            </div>
            <div className="row">
              <MapContainer className="col-xs-12">
                <StyledYearLabel
                  startYear={selectedWaterData.startYear}
                  endYear={selectedWaterData.endYear}
                />
                <Map
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

export const StressEmbed = withPageData(responsive(StressEmbedPlain));
