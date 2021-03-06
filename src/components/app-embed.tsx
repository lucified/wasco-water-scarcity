// react-hot-loader needs to be imported first
import { hot } from 'react-hot-loader';

import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import {
  getHistoricalScenarioId,
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
} from '../selectors';
import { TimeScale } from '../types';
import { ScarcityEmbed } from './embeds/scarcity';
import { ShortageEmbed } from './embeds/shortage';
import { StressEmbed } from './embeds/stress';
import { theme } from './theme';

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
  width: 100%;
  padding: 0 ${theme.margin(1)};
`;

interface GeneratedDispatchProps {
  loadMapData: () => void;
  loadModelData: (
    climateModel: string,
    impactModel: string,
    timeScale: TimeScale,
    scenarioId: string,
  ) => void;
}

interface GeneratedStateProps {
  selectedImpactModel: string;
  selectedClimateModel: string;
  selectedTimeScale: TimeScale;
  scenarioId: string;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

class AppEmbedPlain extends React.Component<Props> {
  public componentDidMount() {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
      scenarioId,
    } = this.props;

    this.props.loadMapData();
    this.props.loadModelData(
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
      scenarioId,
    );
  }

  public render() {
    return (
      <Root>
        <Helmet title="Water Scarcity Atlas embeddable visualizations" />
        <Switch>
          <Route path="/shortage/:play?" component={ShortageEmbed} />
          <Route path="/scarcity/:play?" component={ScarcityEmbed} />
          {/* Default to stress */}
          <Route path="/:ignored?/:play?" component={StressEmbed} />
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
      scenarioId: getHistoricalScenarioId(state),
    }),
    dispatch => ({
      loadMapData: () => {
        // TODO: figure out how to type this: https://github.com/reduxjs/redux-thunk/issues/103
        dispatch(loadMapData() as any);
      },
      loadModelData: (
        climateModel: string,
        impactModel: string,
        timeScale: TimeScale,
        scenarioId: string,
      ) => {
        // TODO: figure out how to type this: https://github.com/reduxjs/redux-thunk/issues/103
        dispatch(loadModelData(
          climateModel,
          impactModel,
          timeScale,
          scenarioId,
        ) as any);
      },
    }),
  )(AppEmbedPlain),
);
