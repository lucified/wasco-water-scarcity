import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

const aaltoLogo = require('../../images/aalto_logo.svg');
const styles = require('./index.scss');

export default function Header() {
  return (
    <div className={styles.root}>
      <div className="container">
        <div className="row between-xs">
          <div
            className={classNames(
              'col-xs-12',
              'col-md-8',
              styles['left-content'],
            )}
          >
            <img src={aaltoLogo} className={styles.logo} />
            <div className={styles.heading}>Water Scarcity Atlas</div>
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-4', styles.disclaimer)}
          >
            <div className={styles.label}>Prototype</div>
            <div>
              The visualizations on this page are experimental and unpolished.
              Mobile devices are not yet supported.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.navigation}>
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <div className={styles['navigation-theme']}>Water body:</div>
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
    </div>
  );
}
