import * as React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData, loadModelData } from '../actions';
import { StateTree } from '../reducers';

require('iframe-resizer/js/iframeResizer.contentWindow.min.js');

// tslint:disable-next-line:ordered-imports
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'normalize.css/normalize.css';
import 'react-select/dist/react-select.css';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../selectors';
import './app.css';
import { ScarcityEmbed } from './embeds/scarcity';
import { ShortageEmbed } from './embeds/shortage';
import { StressEmbed } from './embeds/stress';
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
  width: 100%;
  padding: 0 ${theme.margin(1)};
`;

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

type Props = GeneratedDispatchProps & GeneratedStateProps;

class AppEmbedPlain extends React.Component<Props> {
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

  public render() {
    return (
      <Root>
        <Switch>
          <Route path="/shortage" component={ShortageEmbed} />
          <Route path="/scarcity" component={ScarcityEmbed} />
          {/* Default to stress */}
          <Route component={StressEmbed} />
        </Switch>
      </Root>
    );
  }
}

export const AppEmbed = hot(module)(
  connect<GeneratedStateProps, GeneratedDispatchProps, {}, StateTree>(
    state => ({
      selectedClimateModel: getSelectedClimateModel(state),
      selectedImpactModel: getSelectedImpactModel(state),
      selectedTimeScale: getSelectedTimeScale(state),
    }),
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
        dispatch(loadModelData(climateModel, impactModel, timeScale) as any);
      },
    }),
  )(AppEmbedPlain),
);
