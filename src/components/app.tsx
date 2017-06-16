// tslint:disable:jsx-no-lambda
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Header from './header';
import Future from './pages/future';
import Scarcity from './pages/scarcity';
import Shortage from './pages/shortage';
import Stress from './pages/stress';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;
type Props = PassedProps;

export default function App(_props: Props) {
  return (
    <div className={styles.root}>
      <Header />
      <div className="container">
        <Switch>
          {/* These routes also handle any data loading or other onLoad trigger */}
          <Route path="/stress" component={Stress} />
          <Route path="/shortage" component={Shortage} />
          <Route path="/scarcity" component={Scarcity} />
          <Route path="/future" component={Future} />
          <Route render={() => <Redirect to="/stress" />} />
        </Switch>
      </div>
    </div>
  );
}
