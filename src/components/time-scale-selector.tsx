import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedTimeScale } from '../actions';
import { StateTree } from '../reducers';
import { getSelectedTimeScale } from '../selectors';
import { TimeScale } from '../types';

import RadioSelector from './generic/radio-selector';

interface StateProps {
  timeScale: TimeScale;
}

interface DispatchProps {
  onChange: (option: { value: TimeScale; label: string }) => void;
}

interface PassedProps {
  className?: string;
}

type Props = StateProps & DispatchProps & PassedProps;

const values: Array<{ value: TimeScale; label: string }> = [
  {
    value: 'annual',
    label: 'Annual',
  },
  {
    value: 'decadal',
    label: 'Decadal',
  },
];

function TimeScaleSelector({ className, timeScale, onChange }: Props) {
  return (
    <RadioSelector
      onChange={onChange}
      values={values}
      selectedValue={timeScale}
      className={className}
    />
  );
}

const mapStateToProps = (state: StateTree): StateProps => ({
  timeScale: getSelectedTimeScale(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onChange: (option: { value: TimeScale; label: string }) => {
    dispatch(setSelectedTimeScale(option.value));
  },
});

export default connect<StateProps, DispatchProps, PassedProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TimeScaleSelector);
