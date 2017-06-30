import * as classNames from 'classnames';
import * as React from 'react';

import RadioSelector from '../generic/radio-selector';
import Tooltip from '../generic/tooltip';
import InlineAssumptionSelector from '../inline-assumption-selector';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface PassedProps {
  className?: string;
}

type Props = PassedProps;

export default function ModelSelector({ className }: Props) {
  return (
    <div className={className}>
      <p>
        These estimates of blue water stress and shortage are produced using{' '}
        <span className={styles.assumption}>blue water availability</span> and{' '}
        <span className={styles.assumption}>consumption</span> estimates from
        the water model{' '}
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
      {/*TODO: doesn't necessarily apply to all dataTypes */}
      {/*TODO: currently only visual */}
      <div className={classNames('row', 'between-xs', styles.model)}>
        <Tooltip
          text={
            'Typically some water withdrawn returns to a water body, but ' +
            "cannot necessarily be re-used. What counts as 'use' depends " +
            'on how return flows are treated.'
          }
        >
          Return flows:
        </Tooltip>
        <RadioSelector
          selectedValue="consumption"
          values={[
            { value: 'consumption', label: 'Consumption' },
            { value: 'withdrawal', label: 'Withdrawals' },
          ]}
          disabled={true}
        />
      </div>
    </div>
  );
}
