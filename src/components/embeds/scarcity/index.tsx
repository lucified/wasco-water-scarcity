import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

type Props = RouteComponentProps<{ play?: string }>;

const LoadableScarcityEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "scarcity" */ './embed'),
  loading: Spinner,
  render(loaded: any, props: { autoplay: boolean }) {
    const Component = loaded.default;
    return <Component autoplay={props.autoplay} />;
  },
});

export class ScarcityEmbed extends React.Component<Props> {
  public render() {
    return <LoadableScarcityEmbed autoplay={!!this.props.match.params.play} />;
  }
}
