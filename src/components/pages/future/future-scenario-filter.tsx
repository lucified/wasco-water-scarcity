import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import styled from 'styled-components';
import { setSelectedFutureFilters } from '../../../actions';
import { FutureDataset, FutureScenario } from '../../../data';
import { StateTree } from '../../../reducers';
import {
  getSelectedFutureDataset,
  getSelectedFutureFilters,
} from '../../../selectors';
import MultiSelector, { Option } from '../../generic/multi-selector';
import { BodyText, SectionHeader, SelectorHeader, theme } from '../../theme';

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Section = styled.div`
  margin-bottom: ${theme.defaultMargin * 2}px;
  width: 100%;
`;

const Parameter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: ${theme.defaultMargin}px;

  font-size: 14px;
  font-family: ${theme.labelFontFamily};
  line-height: 1.1;
`;

const StyledMultiSelector = styled(MultiSelector)`
  margin-top: ${theme.defaultMargin / 2}px;
`;

interface PassedProps {
  selectedScenario?: FutureScenario;
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

function toOptions(values: string[]): Option[] {
  return values.map(value => ({
    value,
    label: value,
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
    return (values: string[] | string | null) => {
      let results: string[];
      if (Array.isArray(values)) {
        results = values;
      } else if (values) {
        results = [values];
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
      selectedScenario,
    } = this.props;

    if (!selectedScenario) {
      return null;
    }

    const {
      impactModel,
      climateExperiment,
      climateModel,
      population,
    } = selectedScenario;
    if (
      impactModel === undefined ||
      climateExperiment === undefined ||
      climateModel === undefined ||
      population === undefined
    ) {
      return (
        <div>
          Error: Scenario has an unexpected format and cannot be displayed
        </div>
      );
    }
    return (
      <Main>
        <BodyText>
          The future depends on the actions we take, with outcomes that are also
          uncertain. We provide two starting points to explore the future of
          water scarcity, and how it relates to food (xx% of global water use):
        </BodyText>
        <Section>
          <SectionHeader>Actions</SectionHeader>
          <Parameter>
            <SelectorHeader>Climate scenario</SelectorHeader>
            <StyledMultiSelector
              options={toOptions(selectedFutureDataset.climateExperiments)}
              selectedValues={selectedFutureFilters.climateExperiments}
              onChange={this.createChangeHandler('climateExperiments') as any}
            />
          </Parameter>
          <Parameter>
            <SelectorHeader>Population scenarios</SelectorHeader>
            <StyledMultiSelector
              options={toOptions(selectedFutureDataset.populations)}
              selectedValues={selectedFutureFilters.populations}
              onChange={this.createChangeHandler('populations') as any}
            />
          </Parameter>
        </Section>
        <Section>
          <SectionHeader>Scientific Uncertainties</SectionHeader>
          <Parameter>
            <SelectorHeader>Water models</SelectorHeader>
            <BodyText>
              We use three different global water models, which use different
              methods to estimate water availability and use.
            </BodyText>
            <StyledMultiSelector
              options={toOptions(selectedFutureDataset.impactModels)}
              selectedValues={selectedFutureFilters.impactModels}
              onChange={this.createChangeHandler('impactModels') as any}
            />
          </Parameter>
          <Parameter>
            <SelectorHeader>Climate models</SelectorHeader>
            <StyledMultiSelector
              options={toOptions(selectedFutureDataset.climateModels)}
              onChange={this.createChangeHandler('climateModels') as any}
              selectedValues={selectedFutureFilters.climateModels}
            />
          </Parameter>
        </Section>
      </Main>
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
