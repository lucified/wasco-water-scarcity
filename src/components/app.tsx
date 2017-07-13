import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { loadAppData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../selectors';

import Header from './header';
import Future from './pages/future';
import NotFound from './pages/not-found';
import Scarcity from './pages/scarcity';
import Shortage from './pages/shortage';
import Stress from './pages/stress';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  loadAppData: (
    climateModel: string,
    impactModel: string,
    timeScale: string,
  ) => void;
  loadModelData: (
    climateModel: string,
    impactModel: string,
    timeScale: string,
  ) => void;
}

interface GeneratedStateProps {
  selectedImpactModel: string;
  selectedClimateModel: string;
  selectedTimeScale: string;
}

type Props = PassedProps & GeneratedDispatchProps & GeneratedStateProps;

class App extends React.Component<Props> {
  public componentDidMount() {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
    } = this.props;

    this.props.loadAppData(
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
    );
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
    } = this.props;

    if (
      selectedClimateModel !== nextProps.selectedClimateModel ||
      selectedImpactModel !== nextProps.selectedImpactModel ||
      selectedTimeScale !== nextProps.selectedTimeScale
    ) {
      this.props.loadModelData(
        nextProps.selectedClimateModel,
        nextProps.selectedImpactModel,
        nextProps.selectedTimeScale,
      );
    }
  }

  public render() {
    // tslint:disable:jsx-no-lambda

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
            <Route path="/" exact render={() => <Redirect to="/stress" />} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(
  (state: StateTree): GeneratedStateProps => ({
    selectedClimateModel: getSelectedClimateModel(state),
    selectedImpactModel: getSelectedImpactModel(state),
    selectedTimeScale: getSelectedTimeScale(state),
  }),
  (dispatch: Dispatch<any>): GeneratedDispatchProps => ({
    loadAppData: (
      climateModel: string,
      impactModel: string,
      timeScale: string,
    ) => {
      dispatch(loadAppData(climateModel, impactModel, timeScale));
    },
    loadModelData: (
      climateModel: string,
      impactModel: string,
      timeScale: string,
    ) => {
      dispatch(loadModelData(climateModel, impactModel, timeScale));
    },
  }),
)(App);
