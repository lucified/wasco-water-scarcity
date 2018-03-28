import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../theme';

const aaltoLogo = require('../../images/aalto_logo.svg');

const Root = styled.div`
  border-bottom: 1px solid #f2f2f2;
  font-family: ${theme.headingFontFamily};
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const Logo = styled.img`
  margin-top: ${theme.margin(1)};
  margin-bottom: ${theme.margin(1)};
  margin-left: 0.5rem;
`;

const Disclaimer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  text-align: right;
  color: $color-darker-gray;
  font-weight: lighter;
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: normal;
  margin-bottom: 2px;
`;

const Heading = styled.div`
  font-size: 48px;
  font-weight: 300;
  margin: $default-margin;
`;

const Navigation = styled.div`
  background-color: ${theme.colors.grayLightest};
  width: 100%;

  & .selected {
    border-bottom: 3px solid ${theme.colors.blueAalto};
  }
`;

const NavigationItem = styled(NavLink)`
  display: inline-block;
  padding: ${theme.margin(1)} 0;
  margin-right: ${theme.margin(1)};
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
  color: ${theme.colors.text};

  &:hover {
    color: #666;
  }
`;

const NavigationTheme = styled.div`
  display: inline-block;
  padding: ${theme.margin(1)} 0;
  margin-right: ${theme.margin(1)};
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
  color: ${theme.colors.gray};
`;

export default function Header() {
  return (
    <Root>
      <div className="container">
        <div className="row between-xs">
          <LeftContent className="col-xs-12 col-md-8">
            <Logo src={aaltoLogo} />
            <Heading>Water Scarcity Atlas</Heading>
          </LeftContent>
          <Disclaimer className="col-xs-12 col-md-4">
            <Label>Prototype</Label>
            <div>
              The visualizations on this page are experimental and unpolished.
              Mobile devices are not yet supported.
            </div>
          </Disclaimer>
        </div>
      </div>
      <Navigation>
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <NavigationTheme>Water body:</NavigationTheme>
              <NavigationItem to="/stress" activeClassName="selected">
                Heavy water usage
              </NavigationItem>
              <NavigationItem to="/shortage" activeClassName="selected">
                Meeting water needs
              </NavigationItem>
              <NavigationItem to="/scarcity" activeClassName="selected">
                Water scarcity
              </NavigationItem>
              <NavigationItem to="/future" activeClassName="selected">
                Future actions
              </NavigationItem>
            </div>
          </div>
        </div>
      </Navigation>
    </Root>
  );
}
