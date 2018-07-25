import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { setSelectedGridVariable } from '../actions';
import { GridVariable, gridVariables, labelForGridVariable } from '../data';
import { StateTree } from '../reducers';
import { getSelectedGridVariable } from '../selectors';
import { theme } from './theme';

const GridDataList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: ${theme.margin()} 0;
  min-height: 80px;
  width: 100%;
`;

const GridData = styled.div`
  line-height: 1.3;
`;

const GridDataLink = styled.a`
  font-size: 0.73rem;
  font-family: ${theme.labelFontFamily};
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  ${({ selected }: { selected: boolean }) =>
    selected
      ? `background-color: ${theme.colors.grayDarkest}; color: white`
      : `color: ${theme.colors.grayDarkest}`};
`;

const GridDataName = styled.span`
  white-space: nowrap;
`;

interface StateProps {
  selectedGridVariable: GridVariable;
}

interface DispatchProps {
  onSetGridVariable: (variable: GridVariable) => void;
}

const GRID_DATA_VARIABLES = gridVariables.map(variable => ({
  variable,
  label: labelForGridVariable(variable),
}));

type Props = StateProps & DispatchProps;

class GridVariableSelectorPlain extends React.Component<Props> {
  public render() {
    const { selectedGridVariable } = this.props;

    return (
      <GridDataList>
        {GRID_DATA_VARIABLES.map(({ variable, label }) => (
          <GridData key={variable}>
            <GridDataLink
              onClick={() => {
                this.props.onSetGridVariable(variable);
              }}
              selected={selectedGridVariable === variable}
            >
              <GridDataName>{label}</GridDataName>
            </GridDataLink>
          </GridData>
        ))}
      </GridDataList>
    );
  }
}

export const GridVariableSelector = connect<
  StateProps,
  DispatchProps,
  {},
  StateTree
>(
  state => ({
    selectedGridVariable: getSelectedGridVariable(state),
  }),
  dispatch => ({
    onSetGridVariable: (variable: GridVariable) => {
      dispatch(setSelectedGridVariable(variable));
    },
  }),
)(GridVariableSelectorPlain);
