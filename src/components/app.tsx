import * as React from 'react';
import { hot } from 'react-hot-loader';
import { connect, Dispatch } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { loadMapData, loadModelData } from '../actions';
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

import 'react-select/dist/react-select.css';
import * as styles from './app.scss';

type PassedProps = RouteComponentProps<{}>;

interface GeneratedDispatchProps {
  loadMapData: () => void;
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

    this.props.loadMapData();
    this.props.loadModelData(
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

export default hot(module)(
  connect<GeneratedStateProps, GeneratedDispatchProps, PassedProps, StateTree>(
    (state: StateTree): GeneratedStateProps => ({
      selectedClimateModel: getSelectedClimateModel(state),
      selectedImpactModel: getSelectedImpactModel(state),
      selectedTimeScale: getSelectedTimeScale(state),
    }),
    (dispatch: Dispatch<any>): GeneratedDispatchProps => ({
      loadMapData: () => {
        dispatch(loadMapData());
      },
      loadModelData: (
        climateModel: string,
        impactModel: string,
        timeScale: string,
      ) => {
        dispatch(loadModelData(climateModel, impactModel, timeScale));
      },
    }),
  )(App),
);
