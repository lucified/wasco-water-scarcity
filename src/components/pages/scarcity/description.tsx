import * as React from 'react';
import { Link } from 'react-router-dom';

export default function ScarcityDescription() {
  return (
    <div>
      <p>
        Blue water scarcity is an umbrella concept for situations where there is
        not enough water in rivers, lakes and aquifers to meet all uses. Scarce
        water is shared among the uses by either{' '}
        <Link to="/conflict_cooperation">competition or cooperation</Link>.
        Negative impacts are seen when a use does not have access to enough
        water. From a human perspective, two main categories of impacts are:
      </p>
      <p>
        <b>
          <Link to="/stress">Water stress</Link>
        </b>: a large share of available water is used by humans, such that it
        becomes increasingly difficult to satisfy various competing human and
        environmental needs. This is demand-driven scarcity.
      </p>
      <p>
        <b>
          <Link to="/shortage">Water shortage</Link>
        </b>: a population's water needs cannot be met using locally available
        water. This is population-driven scarcity.
      </p>
      <p>
        Both concepts are explored in more detail on their own pages, but it is
        also useful to see where stress and shortage occur by themselves or
        together. If stress occurs, high demand is causing impacts. If shortage
        occurs, needs cannot be met with current availability. If both occur, a
        region is facing the need to both reduce impacts from their current use,
        and to find other means of meeting their needs.
      </p>
    </div>
  );
}
