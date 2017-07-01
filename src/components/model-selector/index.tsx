import * as React from 'react';

import InlineAssumptionSelector from '../inline-assumption-selector';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface PassedProps {
  className?: string;
  estimateLabel: string;
  includeConsumption?: boolean;
}

type Props = PassedProps;

export default function ModelSelector({
  className,
  estimateLabel,
  includeConsumption,
}: Props) {
  return (
    <div className={className}>
      <p>
        These estimates of blue water {estimateLabel} are produced using{' '}
        <span className={styles.assumption}>blue water availability</span>
        {includeConsumption &&
          <span>
            {' '}and <span className={styles.assumption}>consumption</span>
          </span>}{' '}
        estimates from the water model{' '}
        <InlineAssumptionSelector
          variable="impactModel"
          className={styles.assumption}
        />, driven by climate data from{' '}
        <InlineAssumptionSelector
          variable="climateModel"
          className={styles.assumption}
        />, calculated for{' '}
        <span className={styles.assumption}>food production units</span> at a{' '}
        <InlineAssumptionSelector
          variable="timeScale"
          className={styles.assumption}
        />{' '}
        timescale. Population estimates are from{' '}
        <span className={styles.assumption}>HYDE</span>.
      </p>
      <p>
        <a href="#">Read more</a>. <a href="#">Explore alternatives</a>.
      </p>
    </div>
  );
}
