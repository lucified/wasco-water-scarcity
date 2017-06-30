import * as React from 'react';
import { Link } from 'react-router-dom';

export default function ShortageMoreInformation() {
  return (
    <p>
      Water shortage is considered population-driven scarcity. Water needs are
      in question rather than water use more generally. To calculate water
      availability, upstream withdrawals need to be taken into account (also see{' '}
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
      are usually also analysed separately.{' '}
      <Link to="/green-water">"Green water"</Link> (rainfall and soil moisture)
      and <Link to="/virtual-water-dependency/shortage">
        "virtual water"
      </Link>{' '}
      (importing water-using products) can also increase the effective
      availability of water. These other sources of water could potentially
      decrease water shortage, but bring with them other side-effects.
    </p>
  );
}
