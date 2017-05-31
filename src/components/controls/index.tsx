import * as React from 'react';

import TimeSelector from './time-selector';

export default function Controls() {
  return (
    <div className="container">
      <div className="row">
        <h1>Blue water stress</h1>
        <TimeSelector />
      </div>
    </div>
  );
}
