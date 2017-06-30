import * as React from 'react';
import { Link } from 'react-router-dom';

export default function StressDescription() {
  return (
    <p>
      <b>Blue water stress</b> is a form of scarcity that occurs when a large
      share of water in rivers, lakes and aquifers is taken for human use. Water
      becomes scarce because increasing water use makes it difficult to satisfy
      various competing human and environmental needs.{' '}
      <Link to="/low-water">Low water levels</Link> from increasing use can
      impact on <Link to="/navigation">navigation</Link>,{' '}
      <Link to="/environmental-flow">environmental water needs</Link>, and{' '}
      <Link to="/access-to-water">access to water</Link>. Comparing use to
      availability helps highlight potential blue water stress hotspots before
      focussing on specific impacts. Thresholds for low, moderate and high
      stress are commonly used, but are only indicative.
    </p>
  );
}
