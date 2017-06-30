import * as React from 'react';
import { Link } from 'react-router-dom';

export default function ScarcityMoreInformation() {
  return (
    <p>
      The separate drivers of <Link to="/stress">stress</Link> and{' '}
      <Link to="/shortage">shortage</Link> can be explored on their own pages.
      You can also{' '}
      <Link to="/future/scarcity">
        explore how stress and shortage can be addressed in future
      </Link>.
    </p>
  );
}
