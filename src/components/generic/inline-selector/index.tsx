import * as classNames from 'classnames';
import * as React from 'react';
import Select from 'react-select';

import RadioSelector from '../radio-selector';

import * as styles from './index.scss';

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
          <div className={styles.radio}>
            <RadioSelector
              selectedValue={selectedValue}
              values={options}
              onChange={this.handleChange}
              disabled={disabled}
            />
          </div>
        );
      }

      return (
        <Select
          className={styles.select}
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
      <span
        onClick={this.showSelector}
        className={classNames(styles.link, className)}
      >
        {selectedValue}
        <span className={styles['select-arrow']} />
      </span>
    );
  }
}
