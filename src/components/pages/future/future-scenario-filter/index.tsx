import * as classNames from 'classnames';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import * as Select from 'react-select';

import { setSelectedFutureFilters } from '../../../../actions';
import { FutureDataset } from '../../../../data/types';
import { StateTree } from '../../../../reducers';
import {
  getSelectedFutureDataset,
  getSelectedFutureFilters,
} from '../../../../selectors';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface PassedProps {
  className?: string;
}

interface GeneratedDispatchProps {
  setSelectedFutureFilters: (
    climateModels: string[],
    climateExperiments: string[],
    impactModels: string[],
    populations: string[],
  ) => void;
}

interface GeneratedStateProps {
  selectedFutureFilters: {
    climateModels: string[];
    climateExperiments: string[];
    impactModels: string[];
    populations: string[];
  };
  selectedFutureDataset: FutureDataset;
}

type Props = PassedProps & GeneratedDispatchProps & GeneratedStateProps;

function toOptions(values: string[]): Select.Option[] {
  return values.map(value => ({ value, label: value }));
}

function createChangeHandler(callback: (models: string[]) => void) {
  return (options: Select.Option[] | Select.Option | null) => {
    if (Array.isArray(options)) {
      callback(
        options
          .filter(option => option.value)
          .map(option => String(option.value!)),
      );
    } else if (options) {
      callback([String(options.value)]);
    } else {
      callback([]);
    }
  };
}

class FutureScenarioFilter extends React.Component<Props> {
  private handleClimateModelFilterChange = (climateModels: string[]) => {
    const {
      selectedFutureFilters: { populations, climateExperiments, impactModels },
    } = this.props;

    this.props.setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handleClimateExperimentFilterChange = (
    climateExperiments: string[],
  ) => {
    const {
      selectedFutureFilters: { climateModels, populations, impactModels },
    } = this.props;

    this.props.setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handleImpactModelFilterChange = (impactModels: string[]) => {
    const {
      selectedFutureFilters: { climateModels, climateExperiments, populations },
    } = this.props;

    this.props.setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  private handlePopulationFilterChange = (populations: string[]) => {
    const {
      selectedFutureFilters: {
        climateModels,
        climateExperiments,
        impactModels,
      },
    } = this.props;

    this.props.setSelectedFutureFilters(
      climateModels,
      climateExperiments,
      impactModels,
      populations,
    );
  };

  public render() {
    const {
      selectedFutureFilters,
      selectedFutureDataset,
      className,
    } = this.props;
    return (
      <div className={classNames(styles.content, className)}>
        <div className={styles.parameter}>
          Impact models:
          <Select
            className={styles.dropdown}
            options={toOptions(selectedFutureDataset.impactModels)}
            name="Impact models"
            multi
            clearable={false}
            value={selectedFutureFilters.impactModels}
            onChange={createChangeHandler(this.handleImpactModelFilterChange)}
          />
        </div>
        <div className={styles.parameter}>
          Climate models:
          <Select
            className={styles.dropdown}
            options={toOptions(selectedFutureDataset.climateModels)}
            name="Climate models"
            clearable={false}
            multi
            value={selectedFutureFilters.climateModels}
            onChange={createChangeHandler(this.handleClimateModelFilterChange)}
          />
        </div>
        <div className={styles.parameter}>
          Climate experiments:
          <Select
            className={styles.dropdown}
            options={toOptions(selectedFutureDataset.climateExperiments)}
            name="Climate experiments"
            clearable={false}
            multi
            value={selectedFutureFilters.climateExperiments}
            onChange={createChangeHandler(
              this.handleClimateExperimentFilterChange,
            )}
          />
        </div>
        <div className={styles.parameter}>
          Population models:
          <Select
            className={styles.dropdown}
            options={toOptions(selectedFutureDataset.populations)}
            name="Populations"
            clearable={false}
            multi
            value={selectedFutureFilters.populations}
            onChange={createChangeHandler(this.handlePopulationFilterChange)}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedFutureFilters: getSelectedFutureFilters(state),
    selectedFutureDataset: getSelectedFutureDataset(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedFutureFilters: (
      climateModels: string[],
      climateExperiments: string[],
      impactModels: string[],
      populations: string[],
    ) => {
      dispatch(
        setSelectedFutureFilters(
          climateModels,
          climateExperiments,
          impactModels,
          populations,
        ),
      );
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureScenarioFilter);
