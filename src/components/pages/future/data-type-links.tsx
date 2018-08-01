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

export default function DataTypeLinks() {
  return (
    <Root>
      <Navigation>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <NavigationTheme>Future:</NavigationTheme>
              <NavigationItem
                to={`/stress${window.location.hash}`}
                isActive={(_match, location) =>
                  location.pathname.indexOf('/stress') === 0
                }
                activeClassName="selected"
              >
                Water stress
              </NavigationItem>
              <NavigationItem
                to={`/kcal${window.location.hash}`}
                isActive={(_match, location) =>
                  location.pathname.indexOf('/kcal') === 0
                }
                activeClassName="selected"
              >
                Food production
              </NavigationItem>
            </div>
          </div>
        </div>
      </Navigation>
    </Root>
  );
}
