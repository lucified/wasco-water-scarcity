// react-hot-loader needs to be imported first
import { hot } from 'react-hot-loader';
// tslint:disable-next-line:ordered-imports
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
  isRequestOngoing,
} from '../selectors';
import { historicalDataRequestId } from '../utils';
import NotFound from './pages/not-found';
import { Past } from './pages/past';
import { theme } from './theme';

// TODO: remove
require('iframe-resizer/js/iframeResizer.contentWindow.min.js');

import 'normalize.css/normalize.css';
// tslint:disable-next-line:ordered-imports
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'react-select/dist/react-select.css';
import './app.css';

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
  isLoading: boolean;
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
    const { isLoading } = this.props;
    return (
      <Root>
        <Switch>
          {/* These routes also handle any data loading or other onLoad trigger */}
          <Route
            path="/stress"
            render={() => (
              <Past isLoading={isLoading} selectedDataType="stress" />
            )}
          />
          <Route
            path="/shortage"
            render={() => (
              <Past isLoading={isLoading} selectedDataType="shortage" />
            )}
          />
          <Route
            path="/scarcity"
            render={() => (
              <Past isLoading={isLoading} selectedDataType="scarcity" />
            )}
          />
          <Route path="/" exact render={() => <Redirect to="/stress" />} />
          <Route component={NotFound} />
        </Switch>
      </Root>
    );
  }
}

export const App = hot(module)(
  connect<GeneratedStateProps, GeneratedDispatchProps, PassedProps, StateTree>(
    state => {
      const selectedClimateModel = getSelectedClimateModel(state);
      const selectedImpactModel = getSelectedImpactModel(state);
      const selectedTimeScale = getSelectedTimeScale(state);
      const requestId = historicalDataRequestId(
        selectedClimateModel,
        selectedImpactModel,
        selectedTimeScale,
      );
      return {
        selectedClimateModel,
        selectedImpactModel,
        selectedTimeScale,
        isLoading: isRequestOngoing(state, requestId),
      };
    },
    dispatch => ({
      loadMapData: () => {
        // TODO: remove 'as any' once this is resolved: https://github.com/gaearon/redux-thunk/issues/169
        dispatch(loadMapData() as any);
      },
      loadModelData: (
        climateModel: string,
        impactModel: string,
        timeScale: string,
      ) => {
        // TODO: remove 'as any' once this is resolved: https://github.com/gaearon/redux-thunk/issues/169
        dispatch(loadModelData(
          climateModel,
          impactModel,
          timeScale,
          historicalDataRequestId(climateModel, impactModel, timeScale),
        ) as any);
      },
    }),
  )(AppPlain),
);
