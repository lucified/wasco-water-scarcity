import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { loadAppData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import { getSelectedClimateModel, getSelectedImpactModel } from '../selectors';
import Header from './header';
import Future from './pages/future';
import Scarcity from './pages/scarcity';
import Shortage from './pages/shortage';
import Stress from './pages/stress';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  loadAppData: (climateModel: string, impactModel: string) => void;
  loadModelData: (climateModel: string, impactModel: string) => void;
}

interface GeneratedStateProps {
  selectedImpactModel: string;
  selectedClimateModel: string;
}

type Props = PassedProps & GeneratedDispatchProps & GeneratedStateProps;

class App extends React.Component<Props, void> {
  public componentDidMount() {
    const {
      loadAppData,
      selectedClimateModel,
      selectedImpactModel,
    } = this.props;

    loadAppData(selectedClimateModel, selectedImpactModel);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      selectedClimateModel,
      selectedImpactModel,
      loadModelData,
    } = this.props;

    if (
      selectedClimateModel !== nextProps.selectedClimateModel ||
      selectedImpactModel !== nextProps.selectedImpactModel
    ) {
      loadModelData(
        nextProps.selectedClimateModel,
        nextProps.selectedImpactModel,
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
            {/* tslint:disable-next-line:jsx-no-lambda */}
            <Route render={() => <Redirect to="/stress" />} />
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
  }),
  { loadAppData, loadModelData },
)(App);
