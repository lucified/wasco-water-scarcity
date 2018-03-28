import * as React from 'react';
import styled from 'styled-components';
import CrossReferences from '../../cross-references';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import ModelSelector from '../../model-selector';
import SelectedRegionInformation from '../../selected-region-information';
import { BodyText, SectionHeader, theme } from '../../theme';
import ThresholdSelector from '../../threshold-selector';
import TimeSelector from '../../time-selector';
import WorldRegionSelector from '../../world-region-selector';
import YearLabel from '../../year-label';
import withPageData, { Props } from '../with-page-data';
import Description from './description';
import MoreInformation from './more-information';

const MapContainer = styled.div`
  position: relative;
`;

const StyledYearLabel = styled(YearLabel)`
  position: absolute;
  right: 0;
`;

const StyledModelSelector = styled(ModelSelector)`
  font-family: ${theme.bodyFontFamily};
  font-size: 15px;
  padding-left: ${theme.margin()};
  padding-top: 5px;
  border-left: 1px solid ${theme.colors.grayLight};
  line-height: ${theme.bodyLineHeight};
  color: ${theme.colors.grayDarker};

  b {
    color: ${theme.colors.grayDarkest};
  }
`;

class StressBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <SectionHeader>Water Stress</SectionHeader>
        <div className="row between-xs">
          <BodyText className="col-xs-12 col-md-6">
            <Description />
          </BodyText>
          <div className="col-xs-12 col-md-4">
            <StyledModelSelector estimateLabel="stress" includeConsumption />
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
              <MapContainer className="col-xs-12">
                <StyledYearLabel
                  startYear={selectedWaterData.startYear}
                  endYear={selectedWaterData.endYear}
                />
                <Map
                  width={1200}
                  selectedData={selectedWaterData}
                  waterRegions={waterRegions}
                />
                <WorldRegionSelector />
              </MapContainer>
            </div>
            <div className="row">
              <SelectedRegionInformation dataType="stress" />
            </div>
            <div className="row">
              <BodyText className="col-xs-12 col-md-6">
                <MoreInformation />
              </BodyText>
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
