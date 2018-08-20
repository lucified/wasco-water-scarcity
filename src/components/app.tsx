// react-hot-loader needs to be imported first
import { hot } from 'react-hot-loader';

import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import styled, { injectGlobal } from 'styled-components';
import { loadMapData, loadModelData } from '../actions';
import { StateTree } from '../reducers';
import {
  getHistoricalScenarioId,
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
  getStressShortageDataForScenario,
  isRequestOngoing,
} from '../selectors';
import {
  AppType,
  StressShortageDatum,
  TimeAggregate,
  TimeScale,
} from '../types';
import { Header } from './header';
import { MinWidthWarning } from './min-width-warning';
import NotFound from './pages/not-found';
import { Past } from './pages/past';
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

// TODO: go over copy
const TITLE = 'Exploration tool – Water Scarcity Atlas';
const DESCRIPTION =
  'Explore how water stress, shortage and scarcity have changed in the past using different models';
const META_IMAGE = `${
  process.env.HOST
}${require('../../images/screenshot-explore.png')}`;

type PassedProps = RouteComponentProps<{}>;

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
  selectedScenarioId: string;
  scenarioData?: Array<TimeAggregate<StressShortageDatum>>;
  isLoading: boolean;
}

type Props = PassedProps & GeneratedDispatchProps & GeneratedStateProps;

class AppPlain extends React.Component<Props> {
  public componentDidMount() {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
      selectedScenarioId,
    } = this.props;

    this.props.loadMapData();
    this.props.loadModelData(
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
      selectedScenarioId,
    );
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      selectedClimateModel,
      selectedImpactModel,
      selectedTimeScale,
    } = this.props;

    if (
      !nextProps.isLoading &&
      !nextProps.scenarioData &&
      (selectedClimateModel !== nextProps.selectedClimateModel ||
        selectedImpactModel !== nextProps.selectedImpactModel ||
        selectedTimeScale !== nextProps.selectedTimeScale)
    ) {
      this.props.loadModelData(
        nextProps.selectedClimateModel,
        nextProps.selectedImpactModel,
        nextProps.selectedTimeScale,
        nextProps.selectedScenarioId,
      );
    }
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
        <Header appType={AppType.PAST} />
        <MinWidthWarning minWidth={720}>
          <Switch>
            {/* These routes also handle any data loading or other onLoad trigger */}
            <Route
              path="/stress"
              render={() => <Past selectedDataType="stress" />}
            />
            <Route
              path="/shortage"
              render={() => <Past selectedDataType="shortage" />}
            />
            <Route
              path="/scarcity"
              render={() => <Past selectedDataType="scarcity" />}
            />
            <Route path="/" exact render={() => <Redirect to="/stress" />} />
            <Route component={NotFound} />
          </Switch>
        </MinWidthWarning>
      </Root>
    );
  }
}

export const App = hot(module)(
  connect<GeneratedStateProps, GeneratedDispatchProps, PassedProps, StateTree>(
    state => {
      const selectedScenarioId = getHistoricalScenarioId(state);
      return {
        selectedClimateModel: getSelectedClimateModel(state),
        selectedImpactModel: getSelectedImpactModel(state),
        selectedTimeScale: getSelectedTimeScale(state),
        selectedScenarioId,
        scenarioData: getStressShortageDataForScenario(state),
        isLoading: isRequestOngoing(state, selectedScenarioId),
      };
    },
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
  )(AppPlain),
);
