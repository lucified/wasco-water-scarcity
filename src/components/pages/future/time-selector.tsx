import Slider from 'rc-slider';
import * as React from 'react';
import styled from 'styled-components';

import 'rc-slider/assets/index.css';
import { theme } from '../../theme';

const StyledSlider = styled(Slider)`
  & .rc-slider-handle {
    border-color: ${theme.colors.textSelection};
  }
  & .rc-slider-handle:hover {
    border-color: ${theme.colors.blueDarker};
  }
  & .rc-slider-handle:active {
    border-color: ${theme.colors.blueDarker};
    box-shadow: 0 0 5px ${theme.colors.blueDarker};
  }
  & .rc-slider-handle:focus {
    border-color: ${theme.colors.blueDarker};
    box-shadow: 0 0 0 5px ${theme.colors.textSelection};
  }
`;

interface Props {
  className?: string;
  min: number;
  max: number;
  value: number;
  labels: {
    [index: number]: string;
  };
  labelStyle?: React.CSSProperties;
  onChange: (value: number) => void;
}

export function TimeSelector({ labels, labelStyle, ...restProps }: Props) {
  const mark = {
    [restProps.value]: { style: labelStyle, label: labels[restProps.value] },
  };
  return <StyledSlider {...restProps} marks={mark} included={false} />;
}
