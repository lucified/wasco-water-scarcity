import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

interface ButtonProps {
  selected: boolean;
  disabled?: boolean;
}

const Row = styled.div`
  width: 100%;
  border: ${theme.borderWidth}px solid ${theme.colors.border};
  border-bottom: 0;
  display: flex;
  align-items: center;
  padding: 14px;

  &:first-child {
    border-radius: ${theme.borderRadius}px ${theme.borderRadius}px 0 0;
  }

  &:last-child {
    border: ${theme.borderWidth}px solid ${theme.colors.border};
    border-radius: 0 0 ${theme.borderRadius}px ${theme.borderRadius}px;
  }
`;

const Button = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  font-family: ${theme.labelFontFamily};
  width: 100%;

  position: relative;
  text-decoration: none;
  cursor: ${({ disabled }: ButtonProps) => (disabled ? 'default' : 'pointer')};
  padding-left: 40px;
  padding-right: 10px;
  color: ${({ selected, disabled }: ButtonProps) =>
    disabled
      ? theme.colors.grayLight
      : selected
        ? theme.colors.textSelection
        : theme.colors.textMenu};
  background-color: ${({ selected }: ButtonProps) =>
    selected ? theme.colors.selection : 'white'};

  &:before,
  &:after {
    content: '';
    position: absolute;
  }

  &:before {
    left: 7px;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 20px;
    border-radius: 10px;
    background-color: ${({ disabled, selected }: ButtonProps) =>
      selected && disabled ? theme.colors.gray : 'white'};
    border: ${theme.borderWidth}px solid ${theme.colors.border};
    ${({ selected }: ButtonProps) =>
      selected
        ? `border-color: ${theme.colors.textSelection}; opacity: 0.3;`
        : ''};
  }

  &:after {
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    height: 10px;
    width: 10px;
    border-radius: 5px;
    background-color: ${({ disabled, selected }: ButtonProps) =>
      selected
        ? disabled
          ? theme.colors.gray
          : theme.colors.textSelection
        : 'transparent'};
  }

  &:hover {
    color: ${({ selected }: ButtonProps) =>
      selected ? theme.colors.textSelection : theme.colors.textHover};
    background-color: ${theme.colors.selectionActive};
    ${({ selected }: ButtonProps) =>
      selected ? `text-decoration: none; box-shadow: none;` : ''};
  }

  &:hover:after {
    background-color: ${({ disabled, selected }: ButtonProps) =>
      disabled
        ? 'white'
        : selected
          ? theme.colors.textSelection
          : theme.colors.grayLight};
  }
`;

const Title = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  line-height: 22px;
`;

const Description = styled.div`
  font-weight: 400;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })``;

export interface Option {
  value: string;
  title: string;
  description: string;
  disabled?: boolean;
}

interface PassedProps {
  options: Option[];
  className?: string;
  onChangeMultiSelect: (values: string[]) => void;
  onChangeSelect: (value: string) => void;
  multiSelectedValues: string[];
  selectedValue: string;
  disabled?: boolean;
}

export default class MultiSelector extends React.Component<PassedProps> {
  private generateClickCallback(value: string) {
    return () => {
      this.props.onChangeSelect(value);
    };
  }

  private createCheckboxChangeHandler = (value: string) => {
    return () => {
      const { multiSelectedValues, onChangeMultiSelect } = this.props;
      if (multiSelectedValues.indexOf(value) > -1) {
        onChangeMultiSelect(multiSelectedValues.filter(d => d !== value));
      } else {
        onChangeMultiSelect(multiSelectedValues.concat([value]));
      }
    };
  };

  public render() {
    const {
      multiSelectedValues,
      options,
      disabled: groupDisabled,
      className,
      selectedValue,
    } = this.props;

    return (
      <ButtonGroup className={className}>
        {options.map(({ value, disabled, description, title }) => (
          <Row
            key={`selector-${value}`}
          >
            <Button
              onClick={this.generateClickCallback(value)}
              disabled={groupDisabled || disabled}
              selected={value === selectedValue}
            >
              <Title>{title}</Title>
              <Description>{description}</Description>
            </Button>
            <Checkbox
              value={value}
              checked={multiSelectedValues.indexOf(value) > -1}
              onChange={this.createCheckboxChangeHandler(value)}
            />
          </Row>
        ))}
      </ButtonGroup>
    );
  }
}
