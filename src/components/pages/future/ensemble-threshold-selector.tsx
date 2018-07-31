import Slider from 'rc-slider';
import * as React from 'react';
import styled from 'styled-components';

import 'rc-slider/assets/index.css';
import {
  allKcalEnsembleThresholds,
  allStressEnsembleThresholds,
  KcalEnsembleThreshold,
  StressEnsembleThreshold,
} from '../../../data';
import { FutureDataType } from '../../../types';
import { theme } from '../../theme';

const Container = styled.div`
  width: 280px;
  max-width: 100%;
  float: right;
`;

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

  & .rc-slider-dot-active {
    border-color: ${theme.colors.textSelection};
  }
  & .rc-slider-track {
    background-color: ${theme.colors.textSelection};
  }
`;

interface Props {
  className?: string;
  labelStyle?: React.CSSProperties;
  onChange: (value: StressEnsembleThreshold | KcalEnsembleThreshold) => void;
  threshold: StressEnsembleThreshold | KcalEnsembleThreshold;
  dataType: FutureDataType;
}

export function EnsembleThresholdSelector({
  labelStyle,
  className,
  onChange,
  threshold,
  dataType,
}: Props) {
  const isStressEnsemble = dataType === 'stress';
  const thresholds: Array<
    StressEnsembleThreshold | KcalEnsembleThreshold
  > = isStressEnsemble
    ? allStressEnsembleThresholds
    : allKcalEnsembleThresholds;
  const marks = thresholds.reduce<{
    [value: string]: { style: React.CSSProperties; label: string };
  }>((result, thresh) => {
    result[isStressEnsemble ? thresholds.indexOf(thresh) : thresh] = {
      style: labelStyle || {},
      label: thresh.toString(),
    };
    return result;
  }, {});

  const slider = isStressEnsemble ? (
    <StyledSlider
      className={className}
      value={allStressEnsembleThresholds.indexOf(
        threshold as StressEnsembleThreshold,
      )}
      onChange={index => {
        onChange(allStressEnsembleThresholds[index]);
      }}
      step={null}
      marks={marks}
      included={true}
      min={0}
      max={allStressEnsembleThresholds.length - 1}
    />
  ) : (
    <StyledSlider
      className={className}
      value={threshold as KcalEnsembleThreshold}
      onChange={onChange}
      step={null}
      marks={marks}
      included={true}
      min={allKcalEnsembleThresholds[0]}
      max={allKcalEnsembleThresholds[allKcalEnsembleThresholds.length - 1]}
    />
  );

  return <Container>{slider}</Container>;
}
