// tslint:disable:jsx-no-lambda
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { loadAppData } from '../actions';
import Header from './header';
import Future from './pages/future';
import Scarcity from './pages/scarcity';
import Shortage from './pages/shortage';
import Stress from './pages/stress';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;
interface GeneratedDispatchProps {
  loadAppData: () => void;
}
type Props = PassedProps & GeneratedDispatchProps;

class App extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.loadAppData();
  }

  public render() {
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
}

export default connect<{}, GeneratedDispatchProps, PassedProps>(() => ({}), {
  loadAppData,
})(App);
