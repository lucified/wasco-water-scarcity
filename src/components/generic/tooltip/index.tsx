import * as React from 'react';

require('./index.scss');

interface Props {
  text: string;
  children?: React.ReactNode;
}

export default function Tooltip({ text, children }: Props) {
  return (
    <span data-tooltip={text}>
      {children}
    </span>
  );
}
