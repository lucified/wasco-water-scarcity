import * as React from 'react';
import { NavLink } from 'react-router-dom';

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
              <NavLink
                to="/stress"
                activeClassName={styles.selected}
                className={styles['navigation-item']}
              >
                Heavy water usage
              </NavLink>
              <NavLink
                to="/shortage"
                activeClassName={styles.selected}
                className={styles['navigation-item']}
              >
                Meeting water needs
              </NavLink>
              <NavLink
                to="/scarcity"
                activeClassName={styles.selected}
                className={styles['navigation-item']}
              >
                Water scarcity
              </NavLink>
              <NavLink
                to="/future"
                activeClassName={styles.selected}
                className={styles['navigation-item']}
              >
                Future actions
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
