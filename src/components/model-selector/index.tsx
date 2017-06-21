import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Select from 'react-select';
import { Dispatch } from 'redux';

import {
  setSelectedClimateModel,
  setSelectedImpactModel,
  setSelectedTimeScale,
} from '../../actions';
import { getClimateModels, getImpactModels, getTimeScales } from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../../selectors';

import RadioSelector from '../generic/radio-selector';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

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
}

type Props = StateProps & DispatchProps & PassedProps;

const impactModelOptions = getImpactModels().map(value => ({
  value,
  label: value,
}));
const climateModelOptions = getClimateModels().map(value => ({
  value,
  label: value,
}));
const timeScaleOptions = getTimeScales().map(value => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

class ModelSelector extends React.Component<Props, void> {
  private handleImpactModelChange = (option: {
    value: string;
    label: string;
  }) => {
    this.props.onImpactModelChange(option.value);
  };

  private handleClimateModelChange = (option: {
    value: string;
    label: string;
  }) => {
    this.props.onClimateModelChange(option.value);
  };

  public render() {
    const {
      impactModel,
      climateModel,
      timeScale,
      onTimeScaleChange,
    } = this.props;

    return (
      <div className="col-xs-12 col-md-12 col-lg-12">
        <div className="row">
          <h3 className={styles.title}>Water scarcity model</h3>
        </div>
        <div className="row between-xs">
          <RadioSelector
            className={styles['time-scale-selector']}
            selectedValue={timeScale}
            values={timeScaleOptions}
            onChange={onTimeScaleChange}
          />
        </div>
        <div className={classNames('row', 'between-xs', styles.model)}>
          <span className={styles.label}>Impact model:</span>
          <Select
            className={classNames(styles.select, styles.first)}
            name="Impact model"
            options={impactModelOptions}
            value={impactModel}
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
            options={climateModelOptions}
            value={climateModel}
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
  timeScale: getSelectedTimeScale(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onImpactModelChange: (value: string) => {
    dispatch(setSelectedImpactModel(value));
  },
  onClimateModelChange: (value: string) => {
    dispatch(setSelectedClimateModel(value));
  },
  onTimeScaleChange: (value: string) => {
    dispatch(setSelectedTimeScale(value));
  },
});

export default connect<StateProps, DispatchProps, PassedProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ModelSelector);
