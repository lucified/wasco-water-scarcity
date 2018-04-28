import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  setSelectedClimateModel,
  setSelectedImpactModel,
  setSelectedTimeScale,
} from '../../actions';
import {
  getHistoricalClimateModels,
  getHistoricalImpactModels,
  getTimeScales,
} from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../../selectors';
import { TimeScale } from '../../types';
import InlineSelector, { Option } from '../generic/inline-selector';
import { theme } from '../theme';

const Content = styled.div`
  padding: ${theme.margin(0.5)} 0;
`;

const Assumption = styled.span`
  font-weight: bold;
  color: ${theme.colors.grayDarkest};
`;

const StyledInlineSelector = styled(InlineSelector)`
  font-weight: bold;
  color: ${theme.colors.grayDarkest};
`;

interface StateProps {
  impactModel: string;
  climateModel: string;
  timeScale: string;
}

interface DispatchProps {
  onImpactModelChange: (option: Option) => void;
  onClimateModelChange: (option: Option) => void;
  onTimeScaleChange: (option: Option) => void;
}

interface PassedProps {
  className?: string;
  estimateLabel: string;
  includeConsumption?: boolean;
}

type Props = PassedProps & StateProps & DispatchProps;

const impactModelOptions = getHistoricalImpactModels().map(value => ({
  value,
  label: value,
}));
const climateModelOptions = getHistoricalClimateModels().map(value => ({
  value,
  label: value,
}));
const timeScaleOptions = getTimeScales().map(value => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function ModelSelector({
  className,
  estimateLabel,
  includeConsumption,
  timeScale,
  onTimeScaleChange,
  onClimateModelChange,
  onImpactModelChange,
  impactModel,
  climateModel,
}: Props) {
  return (
    <div className={className}>
      <Content>
        These estimates of blue water {estimateLabel} are produced using{' '}
        <Assumption>blue water availability</Assumption>
        {includeConsumption && (
          <span>
            {' '}
            and <Assumption>consumption</Assumption>
          </span>
        )}{' '}
        estimates from the water model{' '}
        <StyledInlineSelector
          options={impactModelOptions}
          selectedValue={impactModel}
          name="Impact model"
          selector="dropdown"
          onChange={onImpactModelChange}
        />, driven by climate data from{' '}
        <StyledInlineSelector
          options={climateModelOptions}
          selectedValue={climateModel}
          name="Climat model"
          selector="dropdown"
          onChange={onClimateModelChange}
        />, calculated for <Assumption>food production units</Assumption> at a{' '}
        <StyledInlineSelector
          options={timeScaleOptions}
          selectedValue={timeScale}
          onChange={onTimeScaleChange}
          selector="radio"
        />{' '}
        timescale. Population estimates are from <Assumption>HYDE</Assumption>.
      </Content>
      <p>
        <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
      </p>
    </div>
  );
}

export default connect<StateProps, DispatchProps, PassedProps, StateTree>(
  state => ({
    impactModel: getSelectedImpactModel(state),
    climateModel: getSelectedClimateModel(state),
    timeScale: getSelectedTimeScale(state),
  }),
  dispatch => ({
    onImpactModelChange: (option: Option) => {
      dispatch(setSelectedImpactModel(option.value));
    },
    onClimateModelChange: (option: Option) => {
      dispatch(setSelectedClimateModel(option.value));
    },
    onTimeScaleChange: (option: Option) => {
      dispatch(setSelectedTimeScale(option.value as TimeScale));
    },
  }),
)(ModelSelector);
