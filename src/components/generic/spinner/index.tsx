import * as classNames from 'classnames';
import * as React from 'react';

const spinner = require('./spinner.svg');
const styles = require('./index.scss');

interface Props {
  className?: string;
}

export default function Spinner({ className }: Props) {
  return (
    <div className={classNames(styles.spinner, className)}>
      <img src={spinner} />
    </div>
  );
}
