import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

const styles = require('./index.scss');

interface PassedProps {
  fromPage: string;
}

type Props = PassedProps;

export default class Header extends React.Component<Props, void> {
  public render() {
    const { fromPage } = this.props;

    const getLinks = () => {
      switch (fromPage) {
        case 'stress':
          return [
            {
              title: 'Meeting human needs',
              url: '/shortage',
            },
            {
              title: 'Overview of water scarcity',
              url: '/scarcity',
            },
            {
              title: 'What can we do about water scarcity?',
              url: '/future',
            },
          ];

        case 'shortage':
          return [
            {
              title: 'Overview of water scarcity',
              url: '/scarcity',
            },
            {
              title: 'What can we do about water scarcity?',
              url: '/future',
            },
            {
              title: 'Resource availability',
              url: '/stress',
            },
          ];

        case 'scarcity':
          return [
            {
              title: 'What can we do about water scarcity?',
              url: '/future',
            },
            {
              title: 'Resource availability',
              url: '/stress',
            },
            {
              title: 'Meeting human needs',
              url: '/shortage',
            },
          ];

        case 'future':
          return [
            {
              title: 'Water availability',
              url: '/stress',
            },
            {
              title: 'Human water needs',
              url: '/shortage',
            },
            {
              title: 'Low availability + high demand = scarcity',
              url: '/scarcity',
            },
          ];

        default:
          return [];
      }
    };

    return (
      <div className={classNames('col-xs-12', styles.root)}>
        <h3>Where to from here?</h3>
        <div className="row">
          {getLinks().map(link =>
            <div className="col-xs">
              <NavLink className={styles.link} to={link.url}>
                {link.title}
              </NavLink>
            </div>,
          )}
        </div>
      </div>
    );
  }
}
