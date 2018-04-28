import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

type Props = RouteComponentProps<{ play?: string }>;

const LoadableShortageEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "shortage" */ './embed'),
  loading: Spinner,
  render(loaded: any, props: { autoplay: boolean }) {
    const Component = loaded.default;
    return <Component autoplay={props.autoplay} />;
  },
});

export class ShortageEmbed extends React.Component<Props> {
  public render() {
    return <LoadableShortageEmbed autoplay={!!this.props.match.params.play} />;
  }
}
