import * as React from 'react';
import styled from 'styled-components';
import {
  FutureDataset,
  FutureDatasetVariables,
  FutureScenario,
  FutureScenarioVariableName,
} from '../../../data';
import MultiSelector, { Option } from '../../generic/multi-selector';
import { SelectorDescription, SelectorHeader, theme } from '../../theme';

const Variable = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: ${theme.defaultMargin}px;

  font-size: 14px;
  font-family: ${theme.labelFontFamily};
`;

const StyledMultiSelector = styled(MultiSelector)`
  margin-top: ${theme.defaultMargin / 2}px;
`;

interface Props {
  variable: FutureScenarioVariableName;
  title: string;
  description: string;
  multiselect: boolean;
  options: Option[];
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

export class FutureScenarioFilterVariable extends React.Component<Props> {
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
    } = this.props;
    return (
      <Variable key={variable}>
        <SelectorHeader>{title}</SelectorHeader>
        <SelectorDescription>{description}</SelectorDescription>
        <StyledMultiSelector
          multiselect={multiselect}
          multiSelectedValues={comparisonVariables[variable]}
          options={options.filter(
            option =>
              selectedFutureDataset[variable].indexOf(option.value) > -1,
          )}
          selectedValue={selectedScenario[variable]}
          onChangeMultiSelect={this.handleChangeComparison}
          onChangeSelect={this.handleSetSelectedScenario}
          onEnterHoverRow={this.handleHoverEnter}
          onLeaveHoverRow={this.handleHoverLeave}
        />
      </Variable>
    );
  }
}
