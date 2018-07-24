// react-hot-loader needs to be imported first
import { hot } from 'react-hot-loader';
// tslint:disable-next-line:ordered-imports
import * as React from 'react';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData } from '../actions';
import { StateTree } from '../reducers';
import Future from './pages/future';
import NotFound from './pages/not-found';
import { theme } from './theme';

// TODO: remove
require('iframe-resizer/js/iframeResizer.contentWindow.min.js');

import 'normalize.css/normalize.css';
// tslint:disable-next-line:ordered-imports
import 'flexboxgrid/dist/flexboxgrid.min.css';
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

interface GeneratedDispatchProps {
  loadMapData: () => void;
}

type PassedProps = RouteComponentProps<{}>;

type Props = GeneratedDispatchProps & PassedProps;

class AppFuturePlain extends React.Component<Props> {
  public componentDidMount() {
    this.props.loadMapData();
  }

  public render() {
    return (
      <Root>
        <Switch>
          <Route
            path="/stress"
            render={() => <Future selectedDataType="stress" />}
          />
          <Route
            path="/kcal"
            render={() => <Future selectedDataType="kcal" />}
          />
          <Route path="/" exact render={() => <Redirect to="/stress" />} />
          <Route component={NotFound} />
        </Switch>
      </Root>
    );
  }
}

export const AppFuture = hot(module)(
  withRouter(
    connect<{}, GeneratedDispatchProps, {}, StateTree>(
      null,
      dispatch => ({
        loadMapData: () => {
          // TODO: Figure out how to type this: https://github.com/reduxjs/redux-thunk/issues/103
          dispatch(loadMapData() as any);
        },
      }),
    )(AppFuturePlain),
  ),
);
