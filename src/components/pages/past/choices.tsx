// tslint:disable:max-line-length
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  setSelectedClimateModel,
  setSelectedImpactModel,
  setSelectedTimeScale,
} from '../../../actions';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../../../selectors';
import { HistoricalDataType, TimeScale } from '../../../types';
import LowThresholdSelector from '../../low-threshold-selector';
import { BodyText, theme } from '../../theme';
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

// TODO: add links to the descriptions below
const impactModelOptions = [
  {
    title: 'H08',
    description:
      'H08 is a global hydrological model developed by National Institute for Environmental Studies in Japan. The results shown use the model setup from the ISIMIP-Fast Track project',
    value: 'h08',
  },
  {
    title: 'PCR-GlobWB',
    description:
      'PCRGlobWB is a global hydrological model developed at Utrecht University in the Netherlands. The results shown use the model setup from the ISIMIP-Fast Track project',
    value: 'pcrglobwb',
  },
  {
    title: 'WaterGAP',
    description:
      'WaterGAP is a global hydrological model originally developed by University of Kassel in Germany. The results shown use the model setup from Kummu et al. 2016',
    value: 'watergap',
  },
];
const climateModelOptions = [
  {
    title: 'GFDL-ESM2M',
    description: 'NOAA Geophysical Fluid Dynamics Laboratory',
    value: 'gfdl-esm2m',
  },
  {
    title: 'HadGEM2-ES',
    description: 'UK MET office Hadley Centre ',
    value: 'hadgem2-es',
  },
  {
    title: 'WATCH',
    description:
      'The WATCH climate forcing dataset was created as part of the European Union WATCH project. It provides temperature and precipitation data for 1900-2001 for the water models to use.',
    value: 'watch',
  },
];
const timeScaleOptions: Array<{
  title: string;
  description: string;
  value: TimeScale;
}> = [
  {
    title: 'Decadal',
    description:
      'Data on water availability and use is aggregated to 10 year periods. This assumes surplus water can be stored between years, but not for very long periods. This tends to overestimate water availability. Further information on analysis setup',
    value: 'decadal',
  },
  {
    title: 'Annual',
    description:
      'Data on water availability and use is aggregated to twelve month periods (January-December). This assumes surplus water can be stored between months, but not across years. The wet and dry periods are not taken into account. This tends to underestimate water availability - more regions will appear stressed, but can help highlight areas where storage and variability over time are important. Further information on analysis setup',
    value: 'annual',
  },
];

const StyledLowThresholdSelector = styled(LowThresholdSelector)`
  margin-bottom: ${theme.margin()};
`;

function getDescriptionForDataType(dataType: HistoricalDataType) {
  switch (dataType) {
    case 'scarcity':
      return 'Scarcity description TODO';
    case 'stress':
      return 'Stress description TODO';
    case 'shortage':
      return 'Shortage description TODO';
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

    return (
      <div className={className}>
        <BodyText>{getDescriptionForDataType(dataType)}</BodyText>
        {dataType === 'scarcity' && (
          <>
            <StyledLowThresholdSelector dataType="stress" />
            <StyledLowThresholdSelector dataType="shortage" />
          </>
        )}
        <ModelSelector
          title="Climate model"
          description="Climate models description TODO"
          selectedValue={climateModel}
          options={climateModelOptions}
          setModel={onClimateModelChange}
        />
        <ModelSelector
          title="Water model"
          description="We use three different global water models, which use different methods to estimate water availability and use."
          options={impactModelOptions}
          setModel={onImpactModelChange}
          selectedValue={impactModel}
        />
        <ModelSelector
          title="Timescale"
          description="We use three different global water models, which use different methods to estimate water availability and use."
          options={
            climateModel === 'watch'
              ? // WATCH data only has decadal data
                timeScaleOptions.map(o => ({
                  ...o,
                  disabled: o.value === 'annual',
                }))
              : timeScaleOptions
          }
          setModel={onTimeScaleChange}
          selectedValue={timeScale}
        />
        <ModelSelector
          title="Spatial unit of analysis"
          options={[
            {
              value: 'fpu',
              description:
                'Data on water availability and use is aggregated to regions that are mix of river basins and country borders, as used in Kummu et al. 2016. It is assumed that water can be managed and moved within these regions in order to make as much water as possible available for use. Water would only be used from outside these regions if scarcity occurs. In large basins, water is allocated between FPUs  according to discharge. Further information on analysis setup',
              title: 'Food production units',
            },
          ]}
          selectedValue="fpu"
        />
        <ModelSelector title="Population data" description="TODO" />
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
      dispatch(setSelectedTimeScale(value as TimeScale));
    },
  }),
)(ChoicesPlain);
