import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import Map from './map';
import TimeSelector from './time-selector';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

type Props = PassedProps;

class App extends React.Component<Props, void> {
  public render() {
    return (
      <div className={styles.root}>
        <div className={styles.header} />
        <div className={styles.content}>
          <h1>Blue water stress</h1>
          <TimeSelector />
          <Map />
        </div>
        <div className={styles.footer} />
      </div>
    );
  }
}

export default App;
