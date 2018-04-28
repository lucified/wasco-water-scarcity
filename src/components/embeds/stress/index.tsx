import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Spinner from '../../generic/spinner';

const Loadable = require('react-loadable');

type Props = RouteComponentProps<{ play?: string }>;

const LoadableStressEmbed = Loadable({
  loader: () => import(/* webpackChunkName: "stress" */ './embed'),
  loading: Spinner,
  render(loaded: any, props: { autoplay: boolean }) {
    const Component = loaded.default;
    return <Component autoplay={props.autoplay} />;
  },
});

export class StressEmbed extends React.Component<Props> {
  public render() {
    return <LoadableStressEmbed autoplay={!!this.props.match.params.play} />;
  }
}
