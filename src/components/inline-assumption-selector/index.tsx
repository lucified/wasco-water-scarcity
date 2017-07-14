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
  onTimeScaleChange: (value: TimeScale) => void;
}

interface PassedProps {
  variable: 'impactModel' | 'climateModel' | 'timeScale';
  future?: boolean;
  className?: string;
}

type Props = StateProps & DispatchProps & PassedProps;

interface AssumptionSelectorUIs {
  [key: string]: () => JSX.Element;
}

interface EditingState {
  editing: boolean;
}

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

class InlineAssumptionSelector extends React.Component<Props, EditingState> {
  constructor(props: any) {
    super(props);
    this.state = { editing: false };
  }

  private handleImpactModelChange = (option: {
    value: string;
    label: string;
  }) => {
    this.props.onImpactModelChange(option.value);
    this.setState({ editing: false });
  };

  private handleClimateModelChange = (option: {
    value: string;
    label: string;
  }) => {
    this.props.onClimateModelChange(option.value);
    this.setState({ editing: false });
  };

  private handleTimeScaleChange = (value: TimeScale) => {
    this.props.onTimeScaleChange(value);
    this.setState({ editing: false });
  };

  private selectors: AssumptionSelectorUIs = {
    impactModel: () =>
      <Select
        className={styles.select}
        name="Impact model"
        options={impactModelOptions.filter(
          d => !this.props.future || d.value !== 'watergap',
        )}
        value={this.props.impactModel}
        onChange={this.handleImpactModelChange}
        searchable={false}
        clearable={false}
        openOnFocus
        autofocus
      />,
    climateModel: () =>
      <Select
        className={styles.select}
        name="Climate model"
        options={climateModelOptions.filter(
          d => !this.props.future || d.value !== 'watch',
        )}
        value={this.props.climateModel}
        onChange={this.handleClimateModelChange}
        searchable={false}
        clearable={false}
        openOnFocus
        autofocus
      />,
    timeScale: () =>
      <div className={styles['time-scale-selector']}>
        <RadioSelector
          selectedValue={this.props.timeScale}
          values={timeScaleOptions}
          onChange={this.handleTimeScaleChange}
          disabled={this.props.impactModel === 'watergap'}
        />
      </div>,
  };

  private showAssumptionSelector = () => {
    this.setState({ editing: true });
  };

  public render() {
    const { variable, className } = this.props;

    if (this.state.editing) {
      return this.selectors[variable]();
    }

    return (
      <span
        onClick={this.showAssumptionSelector}
        className={classNames(styles.link, className)}
      >
        {this.props[variable]}
        <span className={styles['select-arrow']} />
      </span>
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
  onTimeScaleChange: (value: TimeScale) => {
    dispatch(setSelectedTimeScale(value));
  },
});

export default connect<StateProps, DispatchProps, PassedProps>(
  mapStateToProps,
  mapDispatchToProps,
)(InlineAssumptionSelector);
