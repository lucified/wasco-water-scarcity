import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import Controls from './controls';
import Header from './header';
import Map from './map';
import SelectedRegionInformation from './selected-region-information';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

type Props = PassedProps;

class App extends React.Component<Props, void> {
  public render() {
    return (
      <div className={styles.root}>
        <Header />
        <Controls />
        <div className={styles.content}>
          <Map />
          <SelectedRegionInformation />
        </div>
        <div className={styles.footer} />
      </div>
    );
  }
}

export default App;
