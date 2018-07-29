import * as React from 'react';
import styled from 'styled-components';
import { Option } from '.';
import { theme } from '../../theme';
import { CompareIcon } from '../compare-icon';

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
  position: relative;

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
      ? theme.colors.gray
      : selected
        ? theme.colors.textSelection
        : theme.colors.text};
  background-color: ${({ selected }: ButtonProps) =>
    selected ? theme.colors.selection : 'white'};

  &:before,
  &:after {
    content: '';
    position: absolute;
  }

  &:not(.hide-radio):before {
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

  &:not(.hide-radio):after {
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
    color: ${({ selected, disabled }: ButtonProps) =>
      disabled
        ? theme.colors.gray
        : selected
          ? theme.colors.textSelection
          : theme.colors.textHover};
    background-color: ${theme.colors.selectionActive};
    ${({ selected }: ButtonProps) =>
      selected ? `text-decoration: none; box-shadow: none;` : ''};
  }

  &:not(.hide-radio):hover:after {
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

const Checkbox = styled.input.attrs({ type: 'checkbox', readOnly: true })`
  position: absolute;
  z-index: 1;
  left: 24px;
`;

const StyledIcon = styled(CompareIcon)`
  position: absolute;
  top: 0px;
  right: 0px;
`;

interface Props {
  onMultiSelectToggle?: (values: string) => void;
  onChangeSelect?: (value: string) => void;
  onEnterHoverRow?: (value: string) => void;
  onLeaveHoverRow?: (value: string) => void;
  option: Option;
  multiselectChecked: boolean;
  selected: boolean;
  multiselect?: boolean;
}

export class MultiSelectorRow extends React.Component<Props> {
  private handleMultiselectChange = () => {
    if (this.props.onMultiSelectToggle) {
      this.props.onMultiSelectToggle(this.props.option.value);
    }
  };

  private handleSelectToggle = () => {
    if (this.props.onChangeSelect) {
      this.props.onChangeSelect(this.props.option.value);
    }
  };

  private handleMouseEnter = () => {
    if (this.props.onEnterHoverRow) {
      this.props.onEnterHoverRow(this.props.option.value);
    }
  };

  private handleMouseLeave = () => {
    if (this.props.onLeaveHoverRow) {
      this.props.onLeaveHoverRow(this.props.option.value);
    }
  };

  public render() {
    const {
      multiselect,
      option: { value, title, disabled, description },
      multiselectChecked,
      selected,
    } = this.props;
    return (
      <Row
        onClick={
          multiselect ? this.handleMultiselectChange : this.handleSelectToggle
        }
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {multiselect && <Checkbox value={value} checked={multiselectChecked} />}
        <Button
          className={multiselect ? 'hide-radio' : ''}
          disabled={disabled}
          selected={selected}
        >
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </Button>
        {multiselectChecked && (
          <StyledIcon
            width={20}
            height={20}
            fill="white"
            backgroundColor={theme.colors.gray}
          />
        )}
      </Row>
    );
  }
}
