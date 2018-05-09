import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
`;

interface ButtonProps {
  selected?: boolean;
  disabled?: boolean;
}

const Button = styled.a`
  flex-basis: 0;
  flex-grow: 1;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: ${theme.labelFontFamily};
  text-transform: uppercase;
  line-height: 46px;

  position: relative;
  text-decoration: none;
  display: inline-block;
  border: ${theme.borderWidth}px solid ${theme.colors.border};
  border-right: 0;
  cursor: ${({ disabled }: ButtonProps) => (disabled ? 'default' : 'pointer')};
  height: 48px;
  padding-left: 48px;
  padding-right: 10px;
  color: ${({ selected, disabled }: ButtonProps) =>
    disabled
      ? theme.colors.grayLight
      : selected
        ? theme.colors.textSelection
        : theme.colors.textMenu};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: ${({ selected }: ButtonProps) =>
    selected ? theme.colors.selection : 'white'};

  &:before,
  &:after {
    content: '';
    position: absolute;
  }

  &:before {
    left: 15px;
    top: 14px;
    height: 20px;
    width: 20px;
    border-radius: 10px;
    background-color: ${({ disabled, selected }: ButtonProps) =>
      selected && disabled ? theme.colors.gray : 'white'};
    border: ${theme.borderWidth}px solid ${theme.colors.border};
    ${({ selected }: ButtonProps) =>
      selected ? `border-color: ${theme.colors.red}; opacity: 0.3;` : ''};
  }

  &:after {
    left: 20px;
    top: 19px;
    height: 10px;
    width: 10px;
    border-radius: 5px;
    background-color: ${({ disabled, selected }: ButtonProps) =>
      selected
        ? disabled
          ? theme.colors.gray
          : theme.colors.red
        : 'transparent'};
  }

  &:hover {
    color: ${theme.colors.textHover};
    background-color: ${theme.colors.selectionActive};
    ${({ selected }: ButtonProps) =>
      selected ? `text-decoration: none; box-shadow: none;` : ''};
  }

  &:hover:after {
    background-color: ${({ disabled, selected }: ButtonProps) =>
      disabled
        ? 'white'
        : selected
          ? theme.colors.red
          : theme.colors.grayLight};
  }

  &:first-child {
    border-radius: ${theme.borderRadius}px 0 0 ${theme.borderRadius}px;
  }

  &:last-child {
    border: ${theme.borderWidth}px solid ${theme.colors.border};
    border-radius: 0 ${theme.borderRadius}px ${theme.borderRadius}px 0;
  }
`;

export interface Option {
  value: string;
  label: string;
}

interface PassedProps {
  options: Option[];
  className?: string;
  onChange?: (values: string[]) => void;
  selectedValues: string[];
  disabled?: boolean;
}

export default class MultiSelector extends React.Component<PassedProps> {
  private generateClickCallback(option: Option) {
    return (_e: React.MouseEvent<HTMLAnchorElement>) => {
      const { onChange, selectedValues } = this.props;
      if (onChange) {
        if (selectedValues.find(value => value === option.value)) {
          if (selectedValues.length > 1) {
            onChange(selectedValues.filter(value => value !== option.value));
          }
        } else {
          onChange(selectedValues.concat(option.value));
        }
      }
    };
  }

  public render() {
    const { selectedValues, options, disabled, className } = this.props;

    return (
      <ButtonGroup className={className}>
        {options.map(option => (
          <Button
            key={`selector-${option.value}`}
            onClick={this.generateClickCallback(option)}
            disabled={disabled}
            selected={
              selectedValues.find(value => value === option.value) !== undefined
            }
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    );
  }
}
