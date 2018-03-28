import * as React from 'react';
import styled, { keyframes } from 'styled-components';

const spinner = require('./spinner.svg');

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Root = styled.div`
  width: 44px;
  height: 44px;
  margin: 0 auto;

  animation: ${spin} 0.8s ease-in-out;
  animation-iteration-count: infinite;
`;

interface Props {
  className?: string;
}

export default function Spinner({ className }: Props) {
  return (
    <Root className={className}>
      <img src={spinner} />
    </Root>
  );
}
