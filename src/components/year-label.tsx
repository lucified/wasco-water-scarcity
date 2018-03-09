import * as classNames from 'classnames';
import * as React from 'react';

import * as styles from './year-label.scss';

interface Props {
  startYear: number;
  endYear: number;
  className?: string;
}

export default function YearLabel({ startYear, endYear, className }: Props) {
  const label =
    startYear === endYear ? startYear : [startYear, endYear].join('-');
  return <div className={classNames(styles.label, className)}>{label}</div>;
}
