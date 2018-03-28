import * as React from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { theme } from '../../theme';
import RadioSelector from '../radio-selector';

const Radio = styled.div`
  margin-bottom: ${theme.margin(0.5)};
  display: inline-block;
  width: 250px;
`;

const Link = styled.span`
  cursor: pointer;
  border-bottom: 1px dashed ${theme.colors.grayDarker};
  white-space: nowrap;
`;

const StyledSelect = styled(Select)`
  z-index: 10;
  flex-grow: 1;
  width: 120px;
  height: 24px;
  display: inline-block;
  margin-bottom: -5px;

  .Select-control {
    height: 24px;
  }

  .Select-value {
    line-height: 24px !important;
  }

  .Select-input {
    height: 24px;
  }
`;

const SelectArrow = styled.span`
  border-color: ${theme.colors.grayDarker} transparent transparent;
  border-style: solid;
  border-width: 5px 5px 2.5px;
  display: inline-block;
  height: 0;
  width: 0;
  margin-left: ${theme.margin(0.2)};
  margin-bottom: -1px;
  position: relative;
`;

export interface Option {
  value: string;
  label: string;
}

interface PassedProps {
  options: Option[];
  selectedValue: string;
  onChange: (option: Option) => void;
  name?: string;
  disabled?: boolean;
  selector: 'radio' | 'dropdown';
  className?: string;
}

type Props = PassedProps;

interface EditingState {
  editing: boolean;
}

export default class InlineSelector extends React.Component<
  Props,
  EditingState
> {
  constructor(props: any) {
    super(props);
    this.state = { editing: false };
  }

  private showSelector = () => {
    this.setState({ editing: true });
  };

  private handleChange = (option: any) => {
    // TODO: fix typing
    this.props.onChange(option);
    this.setState({ editing: false });
  };

  public render() {
    const {
      selectedValue,
      className,
      selector,
      options,
      disabled,
      name,
    } = this.props;
    const { editing } = this.state;

    if (editing) {
      if (selector === 'radio') {
        return (
          <Radio>
            <RadioSelector
              selectedValue={selectedValue}
              values={options}
              onChange={this.handleChange}
              disabled={disabled}
            />
          </Radio>
        );
      }

      return (
        <StyledSelect
          name={name}
          options={options}
          value={selectedValue}
          onChange={this.handleChange}
          searchable={false}
          clearable={false}
          openOnFocus
          autofocus
        />
      );
    }

    return (
      <Link onClick={this.showSelector} className={className}>
        {selectedValue}
        <SelectArrow />
      </Link>
    );
  }
}
