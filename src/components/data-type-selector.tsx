import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../actions';
import { StateTree } from '../reducers';
import { getSelectedDataType } from '../selectors';
import { DataType } from '../types';

import RadioSelector from './generic/radio-selector';

interface StateProps {
  dataType: DataType;
}

interface DispatchProps {
  onChange: (option: { value: string; label: string }) => void;
}

interface PassedProps {
  className?: string;
  hideScarcity?: boolean;
}

type Props = StateProps & DispatchProps & PassedProps;

class DataTypeSelector extends React.Component<Props> {
  public render() {
    const { className, dataType, onChange, hideScarcity } = this.props;
    const values: Array<{ value: DataType; label: string }> = [
      {
        value: 'stress',
        label: 'Stress',
      },
      {
        value: 'shortage',
        label: 'Shortage',
      },
    ];

    if (!hideScarcity) {
      values.push({
        value: 'scarcity',
        label: 'Scarcity',
      });
    }

    return (
      <RadioSelector
        onChange={onChange}
        values={values}
        selectedValue={dataType}
        className={className}
      />
    );
  }
}

const mapStateToProps = (state: StateTree): StateProps => ({
  dataType: getSelectedDataType(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onChange: (option: { value: string; label: string }) => {
    dispatch(setSelectedDataType(option.value as DataType)); // TODO: validate
  },
});

export default connect<StateProps, DispatchProps, PassedProps, StateTree>(
  mapStateToProps,
  mapDispatchToProps,
)(DataTypeSelector);
