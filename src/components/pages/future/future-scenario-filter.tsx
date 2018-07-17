import * as React from 'react';
import styled from 'styled-components';
import {
  ComparisonVariables,
  FutureDataset,
  FutureScenario,
} from '../../../data';
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
  selectedScenario: FutureScenario;
  selectedFutureDataset: FutureDataset;
  setScenario: (scenario: FutureScenario) => void;
  comparisonVariables: ComparisonVariables;
  setComparisonVariables: (variables: ComparisonVariables) => void;
}

type Props = PassedProps;

function toOption(value: string): Option {
  return {
    value,
    label: value,
  };
}

class FutureScenarioFilter extends React.Component<Props> {
  private createChangeComparisonHandler = (
    field: keyof ComparisonVariables,
  ) => {
    return (values: string[] | string | null) => {
      let results: string[];
      if (Array.isArray(values)) {
        results = values;
      } else if (values) {
        results = [values];
      } else {
        results = [];
      }

      this.props.setComparisonVariables({
        ...this.props.comparisonVariables,
        [field]: results,
      });
    };
  };

  private createChangeScenarioHandler = (field: keyof FutureScenario) => {
    return (value: string) => {
      this.props.setScenario({
        ...this.props.selectedScenario,
        [field]: value,
      });
    };
  };

  public render() {
    const {
      selectedFutureDataset,
      selectedScenario,
      comparisonVariables,
    } = this.props;

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
              multiSelectedValues={comparisonVariables.climateExperiments}
              options={selectedFutureDataset.climateExperiments.map(toOption)}
              selectedValue={selectedScenario.climateExperiment}
              onChangeMultiSelect={this.createChangeComparisonHandler(
                'climateExperiments',
              )}
              onChangeSelect={this.createChangeScenarioHandler(
                'climateExperiment',
              )}
            />
          </Parameter>
          <Parameter>
            <SelectorHeader>Population scenarios</SelectorHeader>
            <StyledMultiSelector
              multiSelectedValues={comparisonVariables.populations}
              options={selectedFutureDataset.populations.map(toOption)}
              selectedValue={selectedScenario.population}
              onChangeMultiSelect={this.createChangeComparisonHandler(
                'populations',
              )}
              onChangeSelect={this.createChangeScenarioHandler('population')}
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
              multiSelectedValues={comparisonVariables.impactModels}
              options={selectedFutureDataset.impactModels.map(toOption)}
              selectedValue={selectedScenario.impactModel}
              onChangeMultiSelect={this.createChangeComparisonHandler(
                'impactModels',
              )}
              onChangeSelect={this.createChangeScenarioHandler('impactModel')}
            />
          </Parameter>
          <Parameter>
            <SelectorHeader>Climate models</SelectorHeader>
            <StyledMultiSelector
              multiSelectedValues={comparisonVariables.climateModels}
              options={selectedFutureDataset.climateModels.map(toOption)}
              selectedValue={selectedScenario.climateModel}
              onChangeMultiSelect={this.createChangeComparisonHandler(
                'climateModels',
              )}
              onChangeSelect={this.createChangeScenarioHandler('climateModel')}
            />
          </Parameter>
        </Section>
      </Main>
    );
  }
}

export default FutureScenarioFilter;
