import * as React from 'react';
import styled from 'styled-components';
import DataTypeSelector from '../../data-type-selector';
import GapMinder from '../../gapminder';
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

const Selectors = styled.div`
  display: flex;
  flex-direction: column;
`;

// TODO: Don't repeat these on each page
const StyledThresholdSelector = styled(ThresholdSelector)`
  margin-bottom: ${theme.margin()};
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

const MapContainer = styled.div`
  position: relative;
`;

const StyledYearLabel = styled(YearLabel)`
  position: absolute;
  right: 10px;
  top: 10px;
  font-size;: 18px;
`;

class ScarcityBody extends React.Component<Props> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    const { selectedWaterData, waterRegions } = this.props;

    return (
      <div>
        <SectionHeader>Blue Water Scarcity: stress and shortage</SectionHeader>
        <div className="row between-xs">
          <BodyText className="col-xs-12 col-md-6">
            <Description />
          </BodyText>
          <BodyText className="col-xs-12 col-md-4">
            <StyledModelSelector
              estimateLabel="stress and shortage"
              includeConsumption
            />
          </BodyText>
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
                <Selectors>
                  <StyledThresholdSelector dataType="stress" />
                  <StyledThresholdSelector dataType="shortage" />
                  <DataTypeSelector />
                </Selectors>
              </div>
            </div>
            <div className="row middle-xs">
              <MapContainer className="col-xs-12 col-md-6 col-lg-8">
                <StyledYearLabel
                  startYear={selectedWaterData.startYear}
                  endYear={selectedWaterData.endYear}
                />
                <Map
                  width={800}
                  selectedData={selectedWaterData}
                  waterRegions={waterRegions}
                />
              </MapContainer>
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
              <BodyText className="col-xs-12 col-md-6">
                <MoreInformation />
              </BodyText>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withPageData(ScarcityBody);
