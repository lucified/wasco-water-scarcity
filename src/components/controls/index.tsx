import * as React from 'react';

import TimeSelector from './time-selector';

const styles = require('./index.scss');

export default function Controls() {
  return (
    <div className="row">
      <div className="container">
        <div className={styles.content}>
          <h1>Blue water stress</h1>
          <TimeSelector />
        </div>
      </div>
    </div>
  );
}
