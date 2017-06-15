// tslint:disable:jsx-no-lambda

import * as classNames from 'classnames';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import DataSelector from './data-selector';
import Gapminder from './gapminder';
import Header from './header';
import Map from './map';
import FutureIntro from './pages/future/intro';
import ScarcityIntro from './pages/scarcity/intro';
import ShortageIntro from './pages/shortage/intro';
import StressIntro from './pages/stress/intro';
import SelectedRegionInformation from './selected-region-information';
import ThresholdSelector from './threshold-selector';
import TimeSelector from './time-selector';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;
type Props = PassedProps;

export default function App(_props: Props) {
  return (
    <div className={styles.root}>
      <Header />
      <div className="container">
        <Switch>
          {/* These routes also handle any data loading or other onLoad trigger */}
          <Route path="/stress" component={StressIntro} />
          <Route path="/shortage" component={ShortageIntro} />
          <Route path="/scarcity" component={ScarcityIntro} />
          <Route path="/future" component={FutureIntro} />
          <Route render={() => <Redirect to="/stress" />} />
        </Switch>
        <div className="row middle-xs">
          <div className="col-xs-12 col-md-8">
            <TimeSelector />
          </div>
          <div className="col-xs-12 col-md-4">
            <Route
              path="/stress"
              render={() => <ThresholdSelector dataType="stress" />}
            />
            <Route
              path="/shortage"
              render={() => <ThresholdSelector dataType="shortage" />}
            />
            <Route
              path="/scarcity"
              render={() =>
                <div className={styles.selectors}>
                  <ThresholdSelector dataType="stress" />
                  <ThresholdSelector dataType="shortage" />
                  <DataSelector />
                </div>}
            />
          </div>
        </div>
      </div>
      <div className="container">
        <div className={classNames(styles['map-content'], 'row')}>
          <Map />
        </div>
        <div className="row">
          <SelectedRegionInformation />
        </div>
        <Route
          path="/scarcity"
          render={() =>
            <div className="row">
              <Gapminder />
            </div>}
        />
      </div>
    </div>
  );
}
