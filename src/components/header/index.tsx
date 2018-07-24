import * as React from 'react';
import styled from 'styled-components';
import { AppType } from '../../types';

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
  &:hover,
  &.active {
    color: #1468a0;
  }
`;

interface Props {
  appType: AppType;
}

// TODO: update to proper URLs
export function Header({ appType }: Props) {
  if (appType === AppType.EMBED) {
    return null;
  }
  return (
    <section>
      <LogoContainer className="container">
        <a href="https://dev.mediapool.fi/wasco">
          <Logo src={logoFilename} />
        </a>
      </LogoContainer>
      <Navigation>
        <LinkContainer className="container">
          <NavLink href="https://dev.mediapool.fi/wasco">Home</NavLink>
          <NavLink
            className={appType === AppType.PAST ? 'active' : ''}
            href="https://lucify-wasco-staging.netlify.com/"
          >
            Exploration tool
          </NavLink>
          <NavLink
            className={appType === AppType.FUTURE ? 'active' : ''}
            href="https://netlify-future--lucify-wasco-staging.netlify.com/"
          >
            Futures tool
          </NavLink>
        </LinkContainer>
      </Navigation>
    </section>
  );
}
