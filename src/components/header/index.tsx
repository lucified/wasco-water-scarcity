import * as React from 'react';
import styled from 'styled-components';
import { AppType } from '../../types';
import { theme } from '../theme';

const logoFilename = require('./wasco-logo.svg');

const LogoContainer = styled.header`
  padding: 24px 0;
  height: 88px;
`;

const Logo = styled.img`
  width: 384px;
  max-width: 90%;
`;

const Navigation = styled.div`
  height: 45px;
  background: #25c3c3;
  background-image: linear-gradient(-270deg, #256ec3 5%, #25c3c3 100%);
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: 800;
  -webkit-font-smoothing: antialiased;
  height: 100%;
`;

const NavLink = styled.a`
  display: block;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 12px;
  font-style: normal;
  padding: 0.7rem 1rem;
  text-decoration: none;

  &:focus,
  &:hover {
    color: #1468a0;
  }

  &.active {
    color: ${theme.colors.text};
  }
`;

// TODO: update to proper URLs
const WEBSITE_URL = 'https://dev.mediapool.fi/wasco';
const TOOLS = [
  {
    appType: AppType.PAST,
    name: 'Exploration tool',
    url: 'https://explore.waterscarcityatlas.org/',
  },
  {
    appType: AppType.FUTURE,
    name: 'Futures tool',
    url: 'https://futures.waterscarcityatlas.org/',
  },
];

interface Props {
  appType: AppType;
}

export function Header({ appType }: Props) {
  if (appType === AppType.EMBED) {
    return null;
  }
  return (
    <section>
      <LogoContainer className="container-fluid">
        <a href={WEBSITE_URL}>
          <Logo src={logoFilename} />
        </a>
      </LogoContainer>
      <Navigation>
        <LinkContainer className="container-fluid">
          <NavLink href={WEBSITE_URL}>Home</NavLink>
          {TOOLS.map(({ appType: toolAppType, name, url }) => (
            <NavLink
              className={appType === toolAppType ? 'active' : ''}
              href={url}
              key={name}
            >
              {name}
            </NavLink>
          ))}
        </LinkContainer>
      </Navigation>
    </section>
  );
}
