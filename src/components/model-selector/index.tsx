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
import Tooltip from '../generic/tooltip';

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
        <div className={classNames('row', 'between-xs', styles.model)}>
          <Tooltip
            text={
              'Water models provide a representation of a water system, ' +
              'enabling internally consistent estimates of variables such as ' +
              'availability and use.'
            }
          >
            <span className={styles.label}>Water model:</span>
          </Tooltip>
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
          <Tooltip
            text={
              'Climate models describe drivers of a water system, like ' +
              'precipitation and temperature, filling measurement gaps and ' +
              'enabling future scenarios.'
            }
          >
            <span className={styles.label}>Climate model:</span>
          </Tooltip>
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
        <div className={classNames('row', 'between-xs', styles.model)}>
          <Tooltip
            text={
              'It is difficult to estimate scarcity at every instant. Water ' +
              'can be stored, or use of water can be delayed. Estimating ' +
              'scarcity for a period of time allows for shifts in timing ' +
              'within the period.'
            }
          >
            Time:
          </Tooltip>
          <RadioSelector
            className={styles['time-scale-selector']}
            selectedValue={timeScale}
            values={timeScaleOptions}
            onChange={onTimeScaleChange}
            disabled={impactModel === 'watergap'}
          />
        </div>
        {/*TODO: doesn't necessarily apply to all dataTypes */}
        {/*TODO: currently only visual */}
        <div className={classNames('row', 'between-xs', styles.model)}>
          <Tooltip
            text={
              'Typically some water withdrawn returns to a water body, but ' +
              "cannot necessarily be re-used. What counts as 'use' depends " +
              'on how return flows are treated.'
            }
          >
            Return flows:
          </Tooltip>
          <RadioSelector
            className={styles['time-scale-selector']}
            selectedValue="consumption"
            values={[
              { value: 'consumption', label: 'Consumption' },
              { value: 'withdrawal', label: 'Withdrawals' },
            ]}
            disabled={true}
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
