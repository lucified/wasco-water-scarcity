import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
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

import * as styles from './index.scss';

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
      <div className={styles.content}>
        These estimates of blue water {estimateLabel} are produced using{' '}
        <span className={styles.assumption}>blue water availability</span>
        {includeConsumption && (
          <span>
            {' '}
            and <span className={styles.assumption}>consumption</span>
          </span>
        )}{' '}
        estimates from the water model{' '}
        <InlineSelector
          options={impactModelOptions}
          selectedValue={impactModel}
          name="Impact model"
          selector="dropdown"
          onChange={onImpactModelChange}
          className={styles.assumption}
        />, driven by climate data from{' '}
        <InlineSelector
          options={climateModelOptions}
          selectedValue={climateModel}
          name="Climat model"
          selector="dropdown"
          onChange={onClimateModelChange}
          className={styles.assumption}
        />, calculated for{' '}
        <span className={styles.assumption}>food production units</span> at a{' '}
        <InlineSelector
          options={timeScaleOptions}
          selectedValue={timeScale}
          onChange={onTimeScaleChange}
          selector="radio"
          className={styles.assumption}
        />{' '}
        timescale. Population estimates are from{' '}
        <span className={styles.assumption}>HYDE</span>.
      </div>
      <p>
        <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
      </p>
    </div>
  );
}

const mapStateToProps = (state: StateTree): StateProps => ({
  impactModel: getSelectedImpactModel(state),
  climateModel: getSelectedClimateModel(state),
  timeScale: getSelectedTimeScale(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onImpactModelChange: (option: Option) => {
    dispatch(setSelectedImpactModel(option.value));
  },
  onClimateModelChange: (option: Option) => {
    dispatch(setSelectedClimateModel(option.value));
  },
  onTimeScaleChange: (option: Option) => {
    dispatch(setSelectedTimeScale(option.value as TimeScale));
  },
});

export default connect<StateProps, DispatchProps, PassedProps, StateTree>(
  mapStateToProps,
  mapDispatchToProps,
)(ModelSelector);
