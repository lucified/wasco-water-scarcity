import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../theme';

const Root = styled.div`
  margin-bottom: ${theme.margin(2)};
  width: 100%;
`;

const Link = styled(NavLink)`
  display: inline-block;
  width: 100%;
  min-height: 60px;
  margin-right: ${theme.margin()};
  margin-bottom: ${theme.margin()};
  padding: ${theme.margin()};
  border: 1px solid ${theme.colors.grayLightest};
  color: ${theme.colors.grayDarker};
  font-family: ${theme.headingFontFamily};
  font-weight: 600;
  text-decoration: none;

  &:visited {
    color: ${theme.colors.grayDark};
  }
`;

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

export default class Header extends React.Component<Props> {
  public render() {
    const { fromPage } = this.props;

    if (['stress', 'shortage', 'scarcity', 'future'].indexOf(fromPage) < 0) {
      console.error('Unknown fromPage', fromPage);
      return null;
    }

    return (
      <Root className="col-xs-12">
        <h3>Where to from here?</h3>
        <div className="row">
          {references[fromPage].map(link => (
            <div className="col-xs" key={`link-to-${link.url}`}>
              <Link key={link.url} to={link.url}>
                {link.title}
              </Link>
            </div>
          ))}
        </div>
      </Root>
    );
  }
}
