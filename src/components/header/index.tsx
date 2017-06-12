import * as React from 'react';

const aaltoLogo = require('../../images/aalto_logo.svg');
const styles = require('./index.scss');

export default class Header extends React.Component<{}, void> {
  public render() {
    return (
      <div className={styles.root}>
        <div className="container">
          <div className="row">
            <img src={aaltoLogo} className={styles.logo} />
            <div className={styles.heading}>Water Scarcity Atlas</div>
          </div>
        </div>
        <div className={styles.navigation}>
          <div className="container">
            <div className="row">
              <div className={styles['navigation-item']}>
                Heave water usage
              </div>
              <div className={styles['navigation-item']}>
                Meeting water needs
              </div>
              <div className={styles['navigation-item']}>
                Water scarcity
              </div>
              <div className={styles['navigation-item']}>
                Future actions
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
