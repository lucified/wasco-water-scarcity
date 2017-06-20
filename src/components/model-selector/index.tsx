import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Select from 'react-select';
import { Dispatch } from 'redux';

import { setSelectedClimateModel, setSelectedImpactModel } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
} from '../../selectors';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface StateProps {
  impactModel: string;
  climateModel: string;
}

interface DispatchProps {
  onImpactModelChange: (value: string) => void;
  onClimateModelChange: (value: string) => void;
}

interface PassedProps {
  className?: string;
}

type Props = StateProps & DispatchProps & PassedProps;

const impactModels = [
  { value: 'impactmodel1', label: 'Impact Model 1' },
  { value: 'impactmodel2', label: 'Impact Model 2' },
];

const climateModels = [
  { value: 'climatemodel1', label: 'Climate Model 1' },
  { value: 'climatemodel2', label: 'Climate Model 2' },
];

class ModelSelector extends React.Component<Props, void> {
  private handleImpactModelChange = (value: {
    value: string;
    label: string;
  }) => {
    this.props.onImpactModelChange(value.value);
  };

  private handleClimateModelChange = (value: {
    value: string;
    label: string;
  }) => {
    this.props.onClimateModelChange(value.value);
  };

  public render() {
    return (
      <div className="col-xs-12 col-md-12 col-lg-12">
        <div className="row">
          <h3 className={styles.title}>Water scarcity model</h3>
        </div>
        <div className={classNames('row', 'between-xs', styles.model)}>
          <span className={styles.label}>Impact model:</span>
          <Select
            className={styles.select}
            name="Impact model"
            options={impactModels}
            value={this.props.impactModel}
            onChange={this.handleImpactModelChange}
            searchable={false}
            clearable={false}
          />
        </div>
        <div className={classNames('row', 'between-xs', styles.model)}>
          <span className={styles.label}>Climate model:</span>
          <Select
            className={styles.select}
            name="Climate model"
            options={climateModels}
            value={this.props.climateModel}
            onChange={this.handleClimateModelChange}
            searchable={false}
            clearable={false}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StateTree): StateProps => ({
  impactModel: getSelectedImpactModel(state),
  climateModel: getSelectedClimateModel(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onImpactModelChange: (value: string) => {
    dispatch(setSelectedImpactModel(value));
  },
  onClimateModelChange: (value: string) => {
    dispatch(setSelectedClimateModel(value));
  },
});

export default connect<StateProps, DispatchProps, PassedProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ModelSelector);
