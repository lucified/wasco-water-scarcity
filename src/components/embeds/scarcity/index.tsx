import * as React from 'react';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

const LoadableScarcityEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "scarcity" */ './embed'),
  loading: Spinner,
});

export class ScarcityEmbed extends React.Component {
  public render() {
    return <LoadableScarcityEmbed />;
  }
}
