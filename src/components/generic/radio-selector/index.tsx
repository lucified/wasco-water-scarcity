import * as classNames from 'classnames';
import * as React from 'react';

const styles = require('./index.scss');

export interface Option {
  value: string;
  label: string;
}

interface PassedProps {
  values: Option[];
  className?: string;
  onChange?: (option: Option) => void;
  selectedValue: string;
  disabled?: boolean;
}

export default class RadioSelector extends React.Component<PassedProps> {
  private generateClickCallback(option: Option) {
    return (_e: React.MouseEvent<HTMLAnchorElement>) => {
      const { onChange } = this.props;
      if (onChange) {
        onChange(option);
      }
    };
  }

  public render() {
    const { selectedValue, values, disabled, className } = this.props;

    return (
      <div
        className={classNames(
          styles['button-group'],
          styles.root,
          { [styles.disabled]: disabled },
          className,
        )}
      >
        {values.map(option => (
          <a
            key={`selector-${option.value}`}
            onClick={this.generateClickCallback(option)}
            className={classNames(styles.button, {
              [styles.selected]: selectedValue === option.value,
            })}
          >
            {option.label}
          </a>
        ))}
      </div>
    );
  }
}
