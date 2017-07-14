import * as React from 'react';

import InlineAssumptionSelector from '../inline-assumption-selector';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface PassedProps {
  className?: string;
  estimateLabel: string;
  includeConsumption?: boolean;
  future?: boolean;
}

type Props = PassedProps;

export default function ModelSelector({
  className,
  estimateLabel,
  includeConsumption,
  future,
}: Props) {
  return (
    <div className={className}>
      <div className={styles['content']}>
        These {future ? 'projections' : 'estimates'} of blue water{' '}
        {estimateLabel} are produced using{' '}
        <span className={styles.assumption}>blue water availability</span>
        {includeConsumption &&
          <span>
            {' '}and <span className={styles.assumption}>consumption</span>
          </span>}{' '}
        estimates from the water model{' '}
        <InlineAssumptionSelector
          variable="impactModel"
          className={styles.assumption}
          future={future}
        />, driven by climate data from{' '}
        <InlineAssumptionSelector
          variable="climateModel"
          className={styles.assumption}
          future={future}
        />, calculated for{' '}
        <span className={styles.assumption}>food production units</span> at a{' '}
        <InlineAssumptionSelector
          variable="timeScale"
          className={styles.assumption}
        />{' '}
        timescale. Population estimates are from{' '}
        <span className={styles.assumption}>HYDE</span>.
      </div>
      <p>
        <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
      </p>
    </div>
  );
}
