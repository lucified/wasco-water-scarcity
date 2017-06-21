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
  onChange: (value: DataType) => void;
}

interface PassedProps {
  className?: string;
}

const values = [
  {
    value: 'scarcity',
    label: 'Scarcity',
  },
  {
    value: 'stress',
    label: 'Stress',
  },
  {
    value: 'shortage',
    label: 'Shortage',
  },
];

type Props = StateProps & DispatchProps & PassedProps;

class DataTypeSelector extends React.Component<Props, void> {
  public render() {
    const { className, dataType, onChange } = this.props;

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
  onChange: (value: DataType) => {
    dispatch(setSelectedDataType(value));
  },
});

export default connect<StateProps, DispatchProps, PassedProps>(
  mapStateToProps,
  mapDispatchToProps,
)(DataTypeSelector);
