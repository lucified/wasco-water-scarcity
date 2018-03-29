import * as React from 'react';
import { hot } from 'react-hot-loader';
import { connect, Dispatch } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../selectors';
import Header from './header';
import NotFound from './pages/not-found';
import Scarcity from './pages/scarcity';
import Shortage from './pages/shortage';
import Stress from './pages/stress';

import 'normalize.css/normalize.css';
// tslint:disable-next-line:ordered-imports
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'react-select/dist/react-select.css';
import './app.css';
import { theme } from './theme';

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${theme.headingFontFamily} !important;
    color: ${theme.colors.grayDarkest};
  }

  a {
    color: ${theme.colors.blueChillDarker};
  }
`;

const Root = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`;

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

class AppPlain extends React.Component<Props> {
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
      <Root>
        <Header />
        <div className="container">
          <Switch>
            {/* These routes also handle any data loading or other onLoad trigger */}
            <Route path="/stress" component={Stress} />
            <Route path="/shortage" component={Shortage} />
            <Route path="/scarcity" component={Scarcity} />
            <Route path="/" exact render={() => <Redirect to="/stress" />} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Root>
    );
  }
}

export const App = hot(module)(
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
  )(AppPlain),
);
