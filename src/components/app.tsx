import * as React from 'react';
import { connect } from 'react-redux';
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

class App extends React.Component<Props, void> {
  public componentDidMount() {
    const {
      loadAppData,
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
    } = this.props;

    loadAppData(selectedClimateModel, selectedImpactModel, selectedTimeScale);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
      loadModelData,
    } = this.props;

    if (
      selectedClimateModel !== nextProps.selectedClimateModel ||
      selectedImpactModel !== nextProps.selectedImpactModel ||
      selectedTimeScale !== nextProps.selectedTimeScale
    ) {
      loadModelData(
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
            <Route path="/tbd" render={() => <Redirect to="/stress" />} />
            <Route
              path="/stress/uncertainty"
              render={() => <Redirect to="/stress" />}
            />
            <Route
              path="/shortage/uncertainty"
              render={() => <Redirect to="/shortage" />}
            />
            <Route
              path="/future/stress"
              render={() => <Redirect to="/future" />}
            />
            <Route
              path="/future/shortage"
              render={() => <Redirect to="/future" />}
            />
            <Route
              path="/future/scarcity"
              render={() => <Redirect to="/future" />}
            />
            <Route
              path="/upstream_dependency"
              render={() => <Redirect to="/tbd#upstream_dependency" />}
            />
            <Route
              path="/upstream_dependency/stress"
              render={() => <Redirect to="/tbd#upstream_dependency" />}
            />
            <Route
              path="/upstream_dependency/shortage"
              render={() => <Redirect to="/tbd#upstream_dependency" />}
            />
            <Route
              path="/virtual_water_dependency"
              render={() => <Redirect to="/tbd#virtual_water_dependency" />}
            />
            <Route
              path="/virtual_water_dependency/stress"
              render={() => <Redirect to="/tbd#virtual_water_dependency" />}
            />
            <Route
              path="/virtual_water_dependency/shortage"
              render={() => <Redirect to="/tbd#shortage" />}
            />
            <Route
              path="/sustainability"
              render={() => <Redirect to="/tbd#sustainability" />}
            />
            <Route
              path="/navigation"
              render={() => <Redirect to="/tbd#navigation" />}
            />
            <Route
              path="/environmental_flow"
              render={() => <Redirect to="/tbd#environmental_flow" />}
            />
            <Route
              path="/access_to_water"
              render={() => <Redirect to="/tbd#access_to_water" />}
            />
            <Route
              path="/low_water"
              render={() => <Redirect to="/tbd#low_water" />}
            />
            <Route
              path="/food_security"
              render={() => <Redirect to="/tbd#food_security" />}
            />
            <Route
              path="/fossil_groundwater"
              render={() => <Redirect to="/tbd#fossil_groundwater" />}
            />
            <Route
              path="/interbasin_water_transfers"
              render={() => <Redirect to="/tbd#interbasin_water_transfers" />}
            />
            <Route
              path="/green_water"
              render={() => <Redirect to="/tbd#green_water" />}
            />
            <Route
              path="/drinking_water"
              render={() => <Redirect to="/tbd#drinking_water" />}
            />
            <Route
              path="/water_supply"
              render={() => <Redirect to="/tbd#drinking_water" />}
            />
            <Route
              path="/water_allocation"
              render={() => <Redirect to="/tbd#water_allocation" />}
            />
            <Route
              path="/transboundary_water_management"
              render={() =>
                <Redirect to="/tbd#transboundary_water_management" />}
            />
            <Route
              path="/conflict_cooperation"
              render={() => <Redirect to="/tbd#conflict_cooperation" />}
            />
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
  (state: StateTree) => ({
    selectedClimateModel: getSelectedClimateModel(state),
    selectedImpactModel: getSelectedImpactModel(state),
    selectedTimeScale: getSelectedTimeScale(state),
  }),
  { loadAppData, loadModelData },
)(App);
