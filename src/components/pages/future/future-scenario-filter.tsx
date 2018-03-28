import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import Select, { Option } from 'react-select';
import styled from 'styled-components';
import { setSelectedFutureFilters } from '../../../actions';
import { FutureDataset } from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getSelectedFutureDataset,
  getSelectedFutureFilters,
} from '../../../selectors';
import { theme } from '../../theme';

const Parameter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 14px;
  font-family: ${theme.labelFontFamily};
  line-height: 1.1;
`;

const Dropdown = styled(Select)`
  width: 260px;

  & .Select-value-label {
    font-weight: bold;
  }

  & .Select-value-icon + .Select-value-label {
    font-weight: normal;
  }
`;

interface PassedProps {
  climateModel: string;
  climateExperiment: string;
  impactModel: string;
  population: string;
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

function toOptions(values: string[], selectedValue: string): Option[] {
  return values.map(value => ({
    value,
    label: value,
    clearableValue: value !== selectedValue,
  }));
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
    return (options: Option[] | Option | null) => {
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
      impactModel,
      climateExperiment,
      climateModel,
      population,
      className,
    } = this.props;
    return (
      <div className={`row ${className}`}>
        <div className="col-xs-12 col-md-6">
          <h2>Actions</h2>
          <Parameter>
            Climate scenario:
            <Dropdown
              options={toOptions(
                selectedFutureDataset.climateExperiments,
                climateExperiment,
              )}
              name="Climate experiments"
              clearable={false}
              multi
              value={selectedFutureFilters.climateExperiments}
              onChange={this.createChangeHandler('climateExperiments') as any}
            />
          </Parameter>
          <Parameter>
            Population scenarios:
            <Dropdown
              options={toOptions(selectedFutureDataset.populations, population)}
              name="Populations"
              clearable={false}
              multi
              value={selectedFutureFilters.populations}
              onChange={this.createChangeHandler('populations') as any}
            />
          </Parameter>
        </div>
        <div className="col-xs-12 col-md-6">
          <h2>Uncertainties</h2>
          <Parameter>
            Impact models:
            <Dropdown
              options={toOptions(
                selectedFutureDataset.impactModels,
                impactModel,
              )}
              name="Impact models"
              multi
              clearable={false}
              value={selectedFutureFilters.impactModels}
              onChange={this.createChangeHandler('impactModels') as any}
            />
          </Parameter>
          <Parameter>
            Climate models:
            <Dropdown
              options={toOptions(
                selectedFutureDataset.climateModels,
                climateModel,
              )}
              name="Climate models"
              clearable={false}
              multi
              value={selectedFutureFilters.climateModels}
              onChange={this.createChangeHandler('climateModels') as any}
            />
          </Parameter>
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
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(FutureScenarioFilter);
