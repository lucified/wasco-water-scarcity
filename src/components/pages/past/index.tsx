import * as React from 'react';
import styled from 'styled-components';
import { AppType } from '../../../types';
import Spinner from '../../generic/spinner';
import { GridVariableSelector } from '../../grid-variable-selector';
import { ResponsiveMap } from '../../map/responsive';
import SelectedRegionInformation from '../../selected-region-information';
import { theme, Title, TitleContainer } from '../../theme';
import TimeSelector from '../../time-selector';
import withMapData, { Props as MapDataProps } from '../../with-map-data';
import WorldRegionSelector from '../../world-region-selector';
import YearLabel from '../../year-label';
import { Choices } from './choices';
import DataTypeLinks from './data-type-links';
import { DownloadCSV } from './download-csv';
const Sticky = require('react-stickynode');

const BodyContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
`;

const selectorsWidth = '320px';

const SelectorsContent = styled.div`
  position: relative;
  width: ${selectorsWidth};
  padding-left: ${theme.margin()};
  padding-bottom: ${theme.margin()};
  margin-top: ${theme.margin()};
`;

const Separator = styled.hr`
  border-color: rgba(240, 240, 240, 0.4);
`;

const StyledCSVButton = styled(DownloadCSV)`
  margin: ${theme.margin(0.5)} 0;
`;

const MoreInformation = styled.a`
  color: ${theme.colors.gray};
  font-size: 14px;
  text-align: right;
  display: block;
`;

const StickyGraphics = styled(Sticky)`
  width: calc(100% - ${selectorsWidth});
`;

const MapContainer = styled.div`
  position: relative;
`;

const StyledYearLabel = styled(YearLabel)`
  position: absolute;
  right: 0;
`;

const StyledSpinner = styled(Spinner)`
  margin-top: 40px;
`;

interface PassedProps {
  isLoading: boolean;
}

type Props = MapDataProps & PassedProps;

export class PastBody extends React.Component<Props> {
  public render() {
    const {
      waterRegions,
      selectedDataType,
      selectedWaterData,
      isZoomedIn,
      scenarioId,
    } = this.props;

    return (
      <div>
        <TitleContainer className="container-fluid">
          <Title>Water scarcity exploration tool</Title>
        </TitleContainer>
        <DataTypeLinks />
        <BodyContainer className="container-fluid">
          <StickyGraphics>
            {!waterRegions ? (
              <StyledSpinner />
            ) : (
              <>
                <div className="row middle-xs">
                  <div className="col-xs-12">
                    <TimeSelector dataType={selectedDataType} />
                  </div>
                </div>
                <div className="row ">
                  <MapContainer className="col-xs-12">
                    {selectedWaterData && (
                      <StyledYearLabel
                        startYear={selectedWaterData.startYear}
                        endYear={selectedWaterData.endYear}
                      />
                    )}
                    <ResponsiveMap
                      selectedData={selectedWaterData}
                      selectedDataType={selectedDataType}
                      waterRegions={waterRegions}
                      appType={AppType.PAST}
                      selectedScenarioId={scenarioId}
                    />
                  </MapContainer>
                </div>
                <div className="row">
                  {isZoomedIn ? (
                    <GridVariableSelector />
                  ) : (
                    <WorldRegionSelector />
                  )}
                </div>
                <div className="row">
                  <SelectedRegionInformation dataType={selectedDataType} />
                </div>
              </>
            )}
          </StickyGraphics>
          <SelectorsContent>
            <Choices dataType={selectedDataType} />
            {selectedWaterData && (
              <>
                <Separator />
                <StyledCSVButton />
                {/* TODO: change to proper URL */}
                <MoreInformation href="https://dev.mediapool.fi/wasco/research-data/data-and-code/">
                  More information
                </MoreInformation>
              </>
            )}
          </SelectorsContent>
        </BodyContainer>
      </div>
    );
  }
}

export const Past = withMapData(PastBody);
