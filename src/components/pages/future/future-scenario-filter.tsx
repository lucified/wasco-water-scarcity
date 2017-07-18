import * as classNames from 'classnames';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import * as Select from 'react-select';

import { setSelectedFutureFilters } from '../../../actions';
import { FutureDataset } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedFutureDataset,
  getSelectedFutureFilters,
} from '../../../selectors';

import 'react-select/dist/react-select.css';
import * as styles from './future-scenario-filter.scss';

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

class FutureScenarioFilter extends React.Component<Props> {
  private createChangeHandler = (
    field:
      | 'climateModels'
      | 'climateExperiments'
      | 'impactModels'
      | 'populations',
  ) => {
    // tslint:disable:prefer-conditional-expression
    return (options: Select.Option[] | Select.Option | null) => {
      let results: string[];
      if (Array.isArray(options)) {
        results = options
          .filter(option => option.value)
          .map(option => String(option.value!));
      } else if (options) {
        results = [String(options.value)];
      } else {
        results = [];
      }

      this.handleChange({
        [field]: results,
      });
    };
  };

  private handleChange = (newFilters: {
    climateModels?: string[];
    climateExperiments?: string[];
    impactModels?: string[];
    populations?: string[];
  }) => {
    const filters = {
      ...this.props.selectedFutureFilters,
      ...newFilters,
    };

    this.props.setSelectedFutureFilters(
      filters.climateModels,
      filters.climateExperiments,
      filters.impactModels,
      filters.populations,
    );
  };

  public render() {
    const {
      selectedFutureFilters,
      selectedFutureDataset,
      className,
    } = this.props;
    return (
      <div className={classNames('row', className)}>
        <div className="col-xs-12 col-md-6">
          <h2>Actions</h2>
          <div className={styles.parameter}>
            Climate scenario:
            <Select
              className={styles.dropdown}
              options={toOptions(selectedFutureDataset.climateExperiments)}
              name="Climate experiments"
              clearable={false}
              multi
              value={selectedFutureFilters.climateExperiments}
              onChange={this.createChangeHandler('climateExperiments')}
            />
          </div>
          <div className={styles.parameter}>
            Population scenarios:
            <Select
              className={styles.dropdown}
              options={toOptions(selectedFutureDataset.populations)}
              name="Populations"
              clearable={false}
              multi
              value={selectedFutureFilters.populations}
              onChange={this.createChangeHandler('populations')}
            />
          </div>
        </div>
        <div className="col-xs-12 col-md-6">
          <h2>Uncertainties</h2>
          <div className={styles.parameter}>
            Impact models:
            <Select
              className={styles.dropdown}
              options={toOptions(selectedFutureDataset.impactModels)}
              name="Impact models"
              multi
              clearable={false}
              value={selectedFutureFilters.impactModels}
              onChange={this.createChangeHandler('impactModels')}
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
              onChange={this.createChangeHandler('climateModels')}
            />
          </div>
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
