import * as React from 'react';

import * as styles from './future-scenario-description.scss';

interface PassedProps {
  className?: string;
  estimateLabel: string;
  climateModel: string;
  impactModel: string;
  climateExperiment: string;
  population: string;
  includeConsumption?: boolean;
}

type Props = PassedProps;

export default function FutureModelDescription({
  className,
  estimateLabel,
  climateModel,
  impactModel,
  climateExperiment,
  population,
  includeConsumption,
}: Props) {
  return (
    <div className={className}>
      This scenario of blue water {estimateLabel} is produced using{' '}
      <span className={styles.assumption}>blue water availability</span>
      {includeConsumption &&
        <span>
          {' '}and <span className={styles.assumption}>consumption</span>
        </span>}{' '}
      estimates from the water model{' '}
      <span className={styles.assumption}>{impactModel}</span>, driven by
      climate data from{' '}
      <span className={styles.assumption}>{climateModel}</span> and{' '}
      <span className={styles.assumption}>{climateExperiment}</span> and
      calculated for{' '}
      <span className={styles.assumption}>food production units</span>.
      Population estimates are from{' '}
      <span className={styles.assumption}>{population}</span>.
    </div>
  );
}
