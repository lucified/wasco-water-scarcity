import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedDataType } from '../../selectors';
import { DataType } from '../../types';

const styles = require('./data-selector.scss');

interface StateProps {
  dataType: DataType;
}

interface DispatchProps {
  onChange: (value: DataType) => void;
}

interface PassedProps {
  className?: string;
}

class DataTypeSelector extends React.Component<StateProps & DispatchProps & PassedProps, any> {
  private generateCaseClickCallback(value: DataType) {
    return (_e: React.MouseEvent<HTMLAnchorElement>) => (this.props.onChange(value));
  }

  public render() {
    const caseSelection = this.props.dataType;
    return (
      <div className={classNames(this.props.className, styles['button-group'], styles.root)}>
        <a
          onClick={this.generateCaseClickCallback('blueWaterStress')}
          className={classNames(styles.button, { [styles.selected]: caseSelection === 'blueWaterStress' })}
        >
          Blue Water Stress
        </a>
        <a
          onClick={this.generateCaseClickCallback('blueWaterShortage')}
          className={classNames(styles.button, { [styles.selected]: caseSelection === 'blueWaterShortage' })}
        >
          Blue Water Shortage
        </a>
      </div>
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
