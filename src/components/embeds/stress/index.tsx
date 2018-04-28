import * as React from 'react';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

const LoadableStressEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "stress" */ './embed'),
  loading: Spinner,
});

export class StressEmbed extends React.Component {
  public render() {
    return <LoadableStressEmbed />;
  }
}
