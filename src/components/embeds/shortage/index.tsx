import * as React from 'react';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

const LoadableShortageEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "shortage" */ './embed'),
  loading: Spinner,
});

export class ShortageEmbed extends React.Component {
  public render() {
    return <LoadableShortageEmbed />;
  }
}
