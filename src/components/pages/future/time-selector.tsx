import Slider from 'rc-slider';
import * as React from 'react';

import 'rc-slider/assets/index.css';

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
  return <Slider {...restProps} marks={mark} included={false} />;
}
