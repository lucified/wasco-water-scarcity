import * as classNames from 'classnames';
import * as React from 'react';

const aaltoLogo = require('../../images/aalto_logo.svg');
const styles = require('./index.scss');

export default class Header extends React.Component<{}, void> {
  public render() {
    return (
      <div className={classNames(styles.root, 'row')}>
        <div className='container'>
          <div className={styles.content}>
            <img src={aaltoLogo} className={styles.logo}/>
            <div className={styles.heading}>Water Scarcity Atlas</div>
          </div>
        </div>
      </div>
    );
  }
}
