import * as classNames from 'classnames';
import * as React from 'react';

const styles = require('./index.scss');

interface PassedProps {
  values: Array<{ value: string; label: string }>;
  className?: string;
  onChange: (value: string) => void;
  selectedValue: string;
  disabled?: boolean;
}

export default class RadioSelector extends React.Component<PassedProps, void> {
  private generateClickCallback(value: string) {
    return (_e: React.MouseEvent<HTMLAnchorElement>) =>
      this.props.onChange(value);
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
        {values.map(({ label, value }) =>
          <a
            key={`selector-${value}`}
            onClick={this.generateClickCallback(value)}
            className={classNames(styles.button, {
              [styles.selected]: selectedValue === value,
            })}
          >
            {label}
          </a>,
        )}
      </div>
    );
  }
}
