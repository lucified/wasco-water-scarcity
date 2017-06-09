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
                HEAVY WATER USAGE
              </div>
              <div className={styles['navigation-item']}>
                MEETING WATER NEEDS
              </div>
              <div className={styles['navigation-item']}>
                WATER SCARCITY
              </div>
              <div className={styles['navigation-item']}>
                FUTURE ACTIONS
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
