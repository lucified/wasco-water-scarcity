import * as React from 'react';
import { hot } from 'react-hot-loader';
import { connect, Dispatch } from 'react-redux';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData } from '../actions';
import { StateTree } from '../reducers';
import Future from './pages/future';

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

interface GeneratedDispatchProps {
  loadMapData: () => void;
}

type Props = GeneratedDispatchProps;

class AppFuturePlain extends React.Component<Props> {
  public componentDidMount() {
    this.props.loadMapData();
  }

  public render() {
    return (
      <Root>
        <div className="container">
          <Future />
        </div>
      </Root>
    );
  }
}

export const AppFuture = hot(module)(
  connect<{}, GeneratedDispatchProps, {}, StateTree>(
    null,
    (dispatch: Dispatch<any>): GeneratedDispatchProps => ({
      loadMapData: () => {
        dispatch(loadMapData());
      },
    }),
  )(AppFuturePlain),
);