import * as React from 'react';
import styled from 'styled-components';
import { theme } from './theme';

const Label = styled.div`
  font-family: ${theme.labelFontFamily};
  font-size: 24px;
  font-weight: 300;
  color: ${theme.colors.grayDark};
`;

interface Props {
  startYear: number;
  endYear: number;
  className?: string;
}

export default function YearLabel({ startYear, endYear, className }: Props) {
  const label =
    startYear === endYear ? startYear : [startYear, endYear].join('-');
  return <Label className={className}>{label}</Label>;
}
