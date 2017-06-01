import * as classNames from 'classnames';
import * as React from 'react';

import DataSelector from './data-selector';
import TimeSelector from './time-selector';

const styles = require('./index.scss');

export default function Controls() {
  return (
    <div className="container">
      <div className="row">
        <div className={classNames('col-xs-12', 'col-md-6', styles['data-selector'])}>
          <DataSelector />
        </div>
        <div className="col-xs-12 col-md-6">
          <TimeSelector />
        </div>
      </div>
    </div>
  );
}
