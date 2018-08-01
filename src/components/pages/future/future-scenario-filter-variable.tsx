import { every } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {
  FutureDataset,
  FutureDatasetVariables,
  FutureScenario,
  FutureScenarioVariableName,
} from '../../../data';
import MultiSelector from '../../generic/multi-selector';
import { SelectorDescription, SelectorHeader, theme } from '../../theme';
import { RaggedOption } from './future-scenario-filter';

const Variable = styled.div`
  margin-bottom: ${theme.margin()};

  font-size: 14px;
  font-family: ${theme.labelFontFamily};
`;

const StyledMultiSelector = styled(MultiSelector)`
  margin-top: ${theme.margin(0.5)};
`;

const MoreInformationContainer = styled.div`
  margin-top: ${theme.margin(0.5)};
`;

const MoreInformationContent = styled.div`
  margin-bottom: ${theme.margin(0.5)};
`;

const MoreInformationLink = styled.a`
  display: block;
  cursor: pointer;
`;

interface Props {
  variable: FutureScenarioVariableName;
  title: string;
  description: string;
  multiselect: boolean;
  furtherInformation?: JSX.Element;
  options: RaggedOption[];
  selectedFutureDataset: FutureDataset;
  comparisonVariables: FutureDatasetVariables;
  selectedScenario: FutureScenario;
  setComparisonVariables: (
    variable: FutureScenarioVariableName,
    values: string[],
  ) => void;
  setSelectedScenario: (
    variable: FutureScenarioVariableName,
    value: string,
  ) => void;
  onEnterHoverVariable: (
    variable: FutureScenarioVariableName,
    value: string,
  ) => void;
  onLeaveHoverVariable: (
    variable: FutureScenarioVariableName,
    value: string,
  ) => void;
}

interface State {
  furtherInformationOpen: boolean;
}

export class FutureScenarioFilterVariable extends React.Component<
  Props,
  State
> {
  public state: State = {
    furtherInformationOpen: false,
  };

  private handleChangeComparison = (values: string[]) => {
    this.props.setComparisonVariables(this.props.variable, values);
  };

  private handleSetSelectedScenario = (value: string) => {
    this.props.setSelectedScenario(this.props.variable, value);
  };

  private handleHoverEnter = (value: string) => {
    this.props.onEnterHoverVariable(this.props.variable, value);
  };

  private handleHoverLeave = (value: string) => {
    this.props.onLeaveHoverVariable(this.props.variable, value);
  };

  private toggleFurtherInformation = () => {
    this.setState(state => ({
      furtherInformationOpen: !state.furtherInformationOpen,
    }));
  };

  public render() {
    const {
      variable,
      title,
      description,
      multiselect,
      options,
      selectedFutureDataset,
      selectedScenario,
      comparisonVariables,
      furtherInformation,
    } = this.props;
    const { furtherInformationOpen } = this.state;

    const filteredOptions = options
      .filter(
        option => selectedFutureDataset[variable].indexOf(option.value) > -1,
      )
      .map(o => ({
        ...o,
        disabled: !every(
          o.requiredValues,
          (vals, varname) =>
            vals.indexOf(
              selectedScenario[varname as FutureScenarioVariableName],
            ) > -1,
        ),
      }));

    return (
      <Variable key={variable}>
        <SelectorHeader>{title}</SelectorHeader>
        <SelectorDescription>{description}</SelectorDescription>
        <StyledMultiSelector
          multiselect={multiselect}
          multiSelectedValues={comparisonVariables[variable]}
          options={filteredOptions}
          selectedValue={selectedScenario[variable]}
          onChangeMultiSelect={this.handleChangeComparison}
          onChangeSelect={this.handleSetSelectedScenario}
          onEnterHoverRow={this.handleHoverEnter}
          onLeaveHoverRow={this.handleHoverLeave}
        />
        {furtherInformation && (
          <MoreInformationContainer>
            {furtherInformationOpen && (
              <MoreInformationContent>
                {furtherInformation}
              </MoreInformationContent>
            )}
            <MoreInformationLink onClick={this.toggleFurtherInformation}>
              {furtherInformationOpen ? 'Hide' : 'Show more information'}
            </MoreInformationLink>
          </MoreInformationContainer>
        )}
      </Variable>
    );
  }
}
