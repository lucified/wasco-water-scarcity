import * as React from 'react';
import styled from 'styled-components';
import { WaterRegionGeoJSON } from '../../../data';
import { HistoricalDataType, TimeAggregate } from '../../../types';
import Gapminder from '../../gapminder';
import Spinner from '../../generic/spinner';
import Header from '../../header';
import { ResponsiveMap } from '../../map/responsive';
import SelectedRegionInformation from '../../selected-region-information';
import {
  BodyContainer,
  SelectorsContent,
  StickyGraphics,
  Title,
  TitleContainer,
} from '../../theme';
import TimeSelector from '../../time-selector';
import withMapData from '../../with-map-data';
import WorldRegionSelector from '../../world-region-selector';
import YearLabel from '../../year-label';
import { Choices } from './choices';

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

interface GeneratedStateProps {
  waterRegions?: WaterRegionGeoJSON;
  selectedWaterData?: TimeAggregate<number>;
}

interface PassedProps {
  selectedDataType: HistoricalDataType;
  isLoading: boolean;
}

type Props = GeneratedStateProps & PassedProps;

export class PastBody extends React.Component<Props> {
  public render() {
    const {
      waterRegions,
      selectedDataType,
      selectedWaterData,
      isLoading,
    } = this.props;

    return (
      <div>
        <TitleContainer className="container">
          <Title>Water scarcity exploration tool</Title>
        </TitleContainer>
        <Header />
        <BodyContainer className="container">
          <SelectorsContent>
            <Choices dataType={selectedDataType} />
          </SelectorsContent>
          <StickyGraphics>
            {isLoading || !waterRegions || !selectedWaterData ? (
              <StyledSpinner />
            ) : (
              <>
                <div className="row middle-xs">
                  <div className="col-xs-12">
                    <TimeSelector dataType={selectedDataType} />
                  </div>
                </div>
                <div className="row middle-xs">
                  <MapContainer
                    className={
                      selectedDataType === 'scarcity'
                        ? 'col-xs-12 col-md-6 col-lg-8'
                        : 'col-xs-12'
                    }
                  >
                    <StyledYearLabel
                      startYear={selectedWaterData.startYear}
                      endYear={selectedWaterData.endYear}
                    />
                    <ResponsiveMap
                      selectedData={selectedWaterData}
                      selectedDataType={selectedDataType}
                      waterRegions={waterRegions}
                    />
                  </MapContainer>
                  {selectedDataType === 'scarcity' && (
                    <div className="col-xs-12 col-md-6 col-lg-4">
                      <Gapminder />
                    </div>
                  )}
                </div>
                <div className="row">
                  <WorldRegionSelector />
                </div>
                <div className="row">
                  <SelectedRegionInformation dataType="shortage" />
                </div>
              </>
            )}
          </StickyGraphics>
        </BodyContainer>
      </div>
    );
  }
}

export const Past = withMapData(PastBody);
