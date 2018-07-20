import * as React from 'react';
import styled from 'styled-components';
import { MultiSelectorRow } from './multi-selector-row';

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export interface Option {
  value: string;
  title: string;
  description?: string | JSX.Element;
  disabled?: boolean;
}

interface PassedProps {
  options: Option[];
  className?: string;
  onChangeMultiSelect?: (values: string[]) => void;
  onChangeSelect?: (value: string) => void;
  multiSelectedValues?: string[];
  multiselect?: boolean;
  selectedValue: string;
  onEnterHoverRow?: (value: string) => void;
  onLeaveHoverRow?: (value: string) => void;
}

export default class MultiSelector extends React.Component<PassedProps> {
  private handleToggleMultiselectValue = (value: string) => {
    const { multiSelectedValues, onChangeMultiSelect } = this.props;
    if (multiSelectedValues && onChangeMultiSelect) {
      if (multiSelectedValues.indexOf(value) > -1) {
        onChangeMultiSelect(multiSelectedValues.filter(d => d !== value));
      } else {
        onChangeMultiSelect(multiSelectedValues.concat([value]));
      }
    }
  };

  public render() {
    const {
      multiSelectedValues,
      options,
      className,
      onChangeSelect,
      selectedValue,
      onEnterHoverRow,
      onLeaveHoverRow,
      multiselect,
    } = this.props;

    return (
      <ButtonGroup className={className}>
        {options.map(option => (
          <MultiSelectorRow
            key={`selector-${option.value}`}
            option={option}
            multiselect={multiselect}
            onChangeSelect={onChangeSelect}
            onMultiSelectToggle={this.handleToggleMultiselectValue}
            onEnterHoverRow={onEnterHoverRow}
            onLeaveHoverRow={onLeaveHoverRow}
            multiselectChecked={
              !!multiSelectedValues &&
              multiSelectedValues.indexOf(option.value) > -1
            }
            selected={option.value === selectedValue}
          />
        ))}
      </ButtonGroup>
    );
  }
}
