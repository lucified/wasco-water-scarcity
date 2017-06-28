import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

const styles = require('./index.scss');

interface Reference {
  title: string;
  url: string;
}

interface ReferenceData {
  [fromPage: string]: Reference[];
}

const references: ReferenceData = require('../../../data/cross_references.json');

interface PassedProps {
  fromPage: string;
}

type Props = PassedProps;

export default class Header extends React.Component<Props, void> {
  public render() {
    const { fromPage } = this.props;

    if (['stress', 'shortage', 'scarcity', 'future'].indexOf(fromPage) < 0) {
      console.error('Unknown fromPage', fromPage);
      return null;
    }

    return (
      <div className={classNames('col-xs-12', styles.root)}>
        <h3>Where to from here?</h3>
        <div className="row">
          {references[fromPage].map(link =>
            <div className="col-xs">
              <NavLink key={link.url} className={styles.link} to={link.url}>
                {link.title}
              </NavLink>
            </div>,
          )}
        </div>
      </div>
    );
  }
}
