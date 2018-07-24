import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';

const Root = styled.div`
  border-bottom: 1px solid #f2f2f2;
  font-family: ${theme.headingFontFamily};
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
      <Navigation>
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <NavigationTheme>Water body:</NavigationTheme>
              <NavigationItem
                to={`/stress${window.location.hash}`}
                isActive={(_match, location) =>
                  location.pathname.indexOf('/stress') === 0
                }
                activeClassName="selected"
              >
                Heavy water usage
              </NavigationItem>
              <NavigationItem
                to={`/shortage${window.location.hash}`}
                isActive={(_match, location) =>
                  location.pathname.indexOf('/shortage') === 0
                }
                activeClassName="selected"
              >
                Meeting water needs
              </NavigationItem>
              <NavigationItem
                to={`/scarcity${window.location.hash}`}
                isActive={(_match, location) =>
                  location.pathname.indexOf('/scarcity') === 0
                }
                activeClassName="selected"
              >
                Water scarcity
              </NavigationItem>
            </div>
          </div>
        </div>
      </Navigation>
    </Root>
  );
}
