import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import DataSelector from './data-selector';
import Gapminder from './gapminder';
import Header from './header';
import Map from './map';
import SelectedRegionInformation from './selected-region-information';
import TimeSelector from './time-selector';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

type Props = PassedProps;

class App extends React.Component<Props, void> {
  public render() {
    return (
      <div className={styles.root}>
        <Header />
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <h1>Water Scarcity</h1>
              <p>Placeholder for information text about water scarcity</p>
            </div>
          </div>
          <div className="row middle-xs">
            <div className="col-xs-12 col-md-4">
              <DataSelector />
            </div>
            <div className="col-xs-12 col-md-8">
              <TimeSelector />
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
          <div className="row">
            <Gapminder />
          </div>
        </div>
        <div className={styles.footer} />
      </div>
    );
  }
}

export default App;
