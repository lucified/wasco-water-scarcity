import * as React from 'react';
import { Link } from 'react-router-dom';

export default function ShortageDescription() {
  return (
    <div>
      <p>
        <b>Blue water shortage</b> is a form of scarcity that occurs when a
        population's water needs cannot be met using locally available water.
        Water needs are complex. Products (and "virtual" water) can be imported
        (even <Link to="/drinking-water">drinking water</Link>), leading to{' '}
        <Link to="/virtual-water-dependency/shortage">
          virtual water dependency
        </Link>. In addition to water from rivers, lakes, and aquifers, rainfall
        and soil moisture (
        <Link to="/green-water">"green water"</Link>) may satisfy needs. And
        even if water is available locally, it may be{' '}
        <Link to="/upstream-dependency/shortage">
          dependent on upstream water use
        </Link>.{' '}
      </p>
      <p>
        Evaluating the volume of water available per person highlights potential
        blue water shortage hotspots, before addressing these more detailed
        issues or focussing on specific impacts, e.g. related to{' '}
        <Link to="/food-security">food security</Link> or{' '}
        <Link to="/water-supply">urban water supply systems</Link>. Thresholds
        for low, moderate and high shortage are commonly used, but are only
        indicative.
      </p>
    </div>
  );
}
