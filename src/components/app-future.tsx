// react-hot-loader needs to be imported first
import { hot } from 'react-hot-loader';

import * as React from 'react';
import Helmet from 'react-helmet';
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
import { AppType } from '../types';
import { Header } from './header';
import { MinWidthWarning } from './min-width-warning';
import Future from './pages/future';
import NotFound from './pages/not-found';
import { theme } from './theme';

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

const TITLE = 'Futures tool – Water Scarcity Atlas';
const DESCRIPTION =
  'Compare different future scenarios for global water stress and food supply';
const META_IMAGE = `${
  process.env.HOST
}${require('../../images/screenshot-futures.png')}`;

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
        <Helmet
          title={TITLE}
          meta={[
            {
              name: 'keywords',
              content:
                'water scarcity atlas, water scarcity, water stress, water shortage, atlas, visualization',
            },
            { name: 'description', content: DESCRIPTION },
            {
              property: 'og:description',
              content: DESCRIPTION,
            },
            {
              property: 'og:image',
              content: META_IMAGE,
            },
            {
              property: 'og:title',
              content: TITLE,
            },
            {
              name: 'twitter:title',
              content: TITLE,
            },
            {
              name: 'twitter:text:title',
              content: TITLE,
            },
            {
              name: 'twitter:description',
              content: DESCRIPTION,
            },
            {
              name: 'twitter:image',
              content: META_IMAGE,
            },
            {
              name: 'twitter:card',
              content: 'summary_large_image',
            },
          ]}
        />
        <Header appType={AppType.FUTURE} />
        <MinWidthWarning minWidth={768}>
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
        </MinWidthWarning>
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
