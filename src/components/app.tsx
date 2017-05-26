import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import Footer from './footer';
import Header from './header';
import Map from './map';

import * as styles from './app.scss';

type PassedProps = RouteComponentProps<void>;

type Props = PassedProps;

class App extends React.Component<Props, void> {
  public render() {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.content}>
          <Map />
        </div>
        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;
