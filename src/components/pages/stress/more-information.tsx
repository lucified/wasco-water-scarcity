import * as React from 'react';
import { Link } from 'react-router-dom';

export default function StressMoreInformation() {
  return (
    <div>
      <p>
        Water stress is considered demand-driven scarcity. It can occur even
        with a small population if water use is sufficiently high and water
        availability sufficiently low. Irrigation is the largest water user
        globally, and in most regions, which links water stress to{' '}
        <Link to="/food-security">food security</Link>.
      </p>
      <p>
        To calculate water availability, upstream withdrawals need to be taken
        into account (also see{' '}
        <Link to="/upstream-dependency/stress">upstream dependency</Link>). In
        these results, we allocated more water to regions with high river flows
        (discharge) (
        <a href="#">Read more </a>). To focus on{' '}
        <Link to="/sustainability">sustainability</Link>, availability typically
        only considers renewable freshwater, not{' '}
        <Link to="/fossil-groundwater">fossil groundwater</Link>.{' '}
        <Link to="/interbasin-water-transfers">
          Interbasin water transfers
        </Link>{' '}
        are usually also analysed separately. This explains why water use can be
        higher than availability.
      </p>
    </div>
  );
}
