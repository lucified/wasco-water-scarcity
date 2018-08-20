// tslint:disable:max-line-length
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  setSelectedClimateModel,
  setSelectedImpactModel,
  setSelectedTimeScale,
} from '../../../actions';
import { isTimeScale } from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../../../selectors';
import { HistoricalDataType, TimeScale } from '../../../types';
import LowThresholdSelector from '../../low-threshold-selector';
import { BodyText, SelectorHeader, theme } from '../../theme';
import { ModelSelector } from './model-selector';

interface StateProps {
  impactModel: string;
  climateModel: string;
  timeScale: string;
}

interface DispatchProps {
  onImpactModelChange: (value: string) => void;
  onClimateModelChange: (value: string) => void;
  onTimeScaleChange: (value: string) => void;
}

interface PassedProps {
  className?: string;
  dataType: HistoricalDataType;
}

type Props = PassedProps & StateProps & DispatchProps;

const impactModelOptions = [
  {
    title: 'H08',
    description: 'National Institute for Environmental Studies, Japan',
    value: 'h08',
  },
  {
    title: 'PCR-GlobWB',
    description: 'Utrecht University, Netherlands',
    value: 'pcr-globwb',
  },
  {
    title: 'WaterGAP',
    description: 'University of Kassel, Germany',
    value: 'watergap2',
  },
  {
    title: 'WaterGAP with natural landuse',
    description: (
      <div>
        As used in Kummu et al. 2016.
        <br />
        (only WATCH + decadal)
      </div>
    ),
    value: 'watergap-nat',
  },
];
const climateModelOptions = [
  {
    title: 'WATCH',
    description: (
      <div>
        EU WATCH project
        <br />
        (Weedon et al. 2011)
      </div>
    ),
    value: 'watch',
  },
  {
    title: 'GSWP3',
    description: 'Global Soil Wetness Project',
    value: 'gswp3',
  },
  {
    title: 'PGMFD v.2',
    description: 'Princeton University',
    value: 'princeton',
  },
  {
    title: 'WFD-EI',
    description: 'Weedon et al. 2014',
    value: 'wfdei',
  },
];
const timeScaleOptions: Array<{
  title: string;
  description: string | JSX.Element;
  value: TimeScale;
}> = [
  {
    title: 'Decadal',
    description:
      'Surplus water stored between years, usually overestimating water availability',
    value: 'decadal',
  },
  {
    title: 'Annual',
    description: (
      <div>
        Surplus water stored only between months, usually underestimating water
        availability.
        <br />
        (Irrigation data only)
      </div>
    ),
    value: 'annual',
  },
];

const StyledLowThresholdSelector = styled(LowThresholdSelector)`
  margin-bottom: ${theme.margin()};
`;

const ReadMore = styled.a`
  color: ${theme.colors.gray};
  font-size: 14px;
  display: inline-block;
`;

// TODO: Update all URLs to production URLs

function getDescriptionForDataType(dataType: HistoricalDataType) {
  switch (dataType) {
    case 'scarcity':
      return 'Understanding scarcity requires looking both at where too much water is used and not enough water is available.';
    case 'stress':
      return (
        <div>
          Water stress reflects impacts of high water use relative to water
          availability.
          <ReadMore
            href="https://dev.mediapool.fi/wasco/water-stress/"
            target="_blank"
          >
            Read more
          </ReadMore>
        </div>
      );
    case 'shortage':
      return (
        <div>
          Water shortage means there is not enough water to meet human needs.
          <ReadMore
            href="https://dev.mediapool.fi/wasco/water-shortage/"
            target="_blank"
          >
            Read more
          </ReadMore>
        </div>
      );
  }
}

class ChoicesPlain extends React.Component<Props> {
  public render() {
    const {
      onClimateModelChange,
      onImpactModelChange,
      onTimeScaleChange,
      impactModel,
      climateModel,
      timeScale,
      className,
      dataType,
    } = this.props;

    // prettier-ignore
    return (
      <div className={className}>
        <BodyText>{getDescriptionForDataType(dataType)}</BodyText>
        {dataType === 'scarcity' && (
          <>
            <SelectorHeader>Thresholds</SelectorHeader>
            <StyledLowThresholdSelector dataType="stress" />
            <StyledLowThresholdSelector dataType="shortage" />
          </>
        )}
        <ModelSelector
          title="Spatial unit of analysis"
          description={
            'We aggregate water availability and water use spatially to account for water infrastructure, ' +
            'movement of water users, and uncertainty in location of water.'
          }
          options={[
            {
              value: 'fpu',
              description:
                'A mix of river basins and country borders within which water is assumed to be managed.',
              title: 'Food production units',
            },
          ]}
          selectedValue="fpu"
          furtherInformation={
            <div>
              Data on water availability and use is aggregated to regions that
              are a mix of river basins and country borders, as used in{' '}
              <a href="https://dev.mediapool.fi/wasco/publications/the-worlds-road-to-water-scarcity-shortage-and-stress-in-the-20th-century-and-pathways-towards-sustainability-2016/">
                Kummu et al. 2016
              </a>. It is assumed that water can be managed and moved within these
              regions in order to make as much water as possible available for
              use. Water would only be used from outside these regions if
              scarcity occurs. In large basins, water is allocated between FPUs
              according to discharge.
              <p>
                <a href="http://waterscarcityatlas.org">
                  Full description of analysis
                </a>
              </p>
            </div>
          }
        />
        <ModelSelector
          title="Timescale"
          description="We aggregate water availability and water use over time to account for water storage and uncertainty in timing."
          options={timeScaleOptions}
          setModel={onTimeScaleChange}
          selectedValue={timeScale}
          furtherInformation={
            <div>
              Timing of water availability and use is uncertain and can be
              influenced by management actions. Aggregating availability means
              that timing has less effect on results, but assumes that water can
              be stored over time. For annual data, aggregating to twelve month
              periods (January-December) assumes surplus water cannot be stored
              across years. If water availability is overestimated
              (underestimated), more (less) regions will appear stressed, but
              this can help highlight areas where storage and variability over
              time are important.
              <p>
                <a href="http://waterscarcityatlas.org">
                  Full description of analysis
                </a>
              </p>
            </div>
          }
        />
        <ModelSelector
          title="Climate data"
          description="Water models are driven by temperature and rainfall estimates for the whole world, obtained by reanalysis of observations."
          selectedValue={climateModel}
          options={climateModelOptions}
          setModel={onClimateModelChange}
          furtherInformation={
            <div>
              The WATCH climate forcing dataset was created as part of the
              European Union WATCH project. It provides temperature and
              precipitation data for 1900-2001 for the water models to use.
              <p>
                <a href="http://waterscarcityatlas.org">
                  Full description of analysis
                </a>
              </p>
            </div>
          }
        />
        <ModelSelector
          title="Water model"
          description="Water availability and use are estimated using three global water models"
          options={
            timeScale === 'annual' || climateModel !== 'watch'
              ? // watergap-nat data only has decadal data
                impactModelOptions.map(o => ({
                  ...o,
                  disabled: o.value === 'watergap-nat',
                }))
              : impactModelOptions
          }
          setModel={onImpactModelChange}
          selectedValue={impactModel}
          furtherInformation={
            <div>
              WaterGAP WATCH data with natural landuse is from{' '}
              <a href="https://waterscarcityatlas.org/publications/the-worlds-road-to-water-scarcity-shortage-and-stress-in-the-20th-century-and-pathways-towards-sustainability-2016/">
              Kummu et al. 2016</a>. All other data is from ISIMIP 2a, using current land use.
              <p>
                <a href="http://waterscarcityatlas.org">
                  Full description of analysis
                </a>
              </p>
            </div>
          }
        />
      </div>
    );
  }
}

export const Choices = connect<
  StateProps,
  DispatchProps,
  PassedProps,
  StateTree
>(
  state => ({
    impactModel: getSelectedImpactModel(state),
    climateModel: getSelectedClimateModel(state),
    timeScale: getSelectedTimeScale(state),
  }),
  dispatch => ({
    onImpactModelChange: (value: string) => {
      dispatch(setSelectedImpactModel(value));
    },
    onClimateModelChange: (value: string) => {
      dispatch(setSelectedClimateModel(value));
    },
    onTimeScaleChange: (value: string) => {
      if (isTimeScale(value)) {
        dispatch(setSelectedTimeScale(value));
      }
    },
  }),
)(ChoicesPlain);
