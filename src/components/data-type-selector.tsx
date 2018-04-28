import * as React from 'react';
import { connect } from 'react-redux';
import { setSelectedHistoricalDataType } from '../actions';
import { StateTree } from '../reducers';
import { getSelectedHistoricalDataType } from '../selectors';
import { HistoricalDataType } from '../types';
import RadioSelector from './generic/radio-selector';

interface StateProps {
  dataType: HistoricalDataType;
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
    const values: Array<{ value: HistoricalDataType; label: string }> = [
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

export default connect<StateProps, DispatchProps, PassedProps, StateTree>(
  state => ({
    dataType: getSelectedHistoricalDataType(state),
  }),
  dispatch => ({
    onChange: (option: { value: string; label: string }) => {
      dispatch(
        setSelectedHistoricalDataType(option.value as HistoricalDataType),
      ); // TODO: validate
    },
  }),
)(DataTypeSelector);
