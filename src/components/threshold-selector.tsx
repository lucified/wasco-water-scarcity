import { format } from 'd3-format';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { setThresholdsForDataType } from '../actions';
import {
  defaultDataTypeThresholdMaxValues,
  defaultDataTypeThresholds,
  getDataTypeColors,
} from '../data';
import { StateTree } from '../reducers';
import { getThresholdsForDataType } from '../selectors';
import { FutureDataType } from '../types';
import { theme } from './theme';

// Using esnext modules with TypeScript doesn't allow us to do
// "import * as ... from '...'" imports. We unfortunately lose types here.
const ReactSlider = require('react-slider');

const Root = styled.div`
  margin-bottom: ${theme.margin(2)};
`;

const Header = styled.div`
  margin-bottom: 4px;
  font-family: ${theme.labelFontFamily};
`;

const stressColors = getDataTypeColors('stress');
const shortageColors = getDataTypeColors('shortage');

const StyledReactSlider = styled(ReactSlider)`
  width: 100%;
  height: 26px;

  & .bar-stress,
  & .bar-shortage {
    position: relative;
    top: 2px;
    background: #d2e3e5;
    height: 16px;
    border-radius: 8px;
    margin: 0 6px;

    &.bar-stress-1 {
      background: ${stressColors[0]};
    }

    &.bar-stress-2 {
      background: ${stressColors[1]};
    }

    &.bar-stress-3 {
      background: ${stressColors[2]};
    }

    &.bar-shortage-0 {
      background: ${shortageColors[2]};
    }

    &.bar-shortage-1 {
      background: ${shortageColors[1]};
    }

    &.bar-shortage-2 {
      background: ${shortageColors[0]};
    }
  }

  & .threshold-selector-handle {
    background-color: #aaa;
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    border: 2px solid white;
  }

  & .threshold-selector-active {
    border: 4px solid white !important;
  }
`;

const Labels = styled.div`
  position: relative;
  font-size: 14px;
  font-family: ${theme.labelFontFamily};
  color: ${theme.colors.grayDarker};
  margin: 0 10px;
`;

const Label = styled.span`
  position: absolute;
  top: -4px;
  transform: translate(-50%);
  padding-left: 2px;
`;

const Reset = styled.div`
  position: relative;
`;

const ResetLink = styled.span`
  position: absolute;
  right: 5px;
  top: -5px;
  cursor: pointer;
  color: ${theme.colors.grayDark};
  font-size: 14px;
  font-weight: lighter;
  font-family: ${theme.labelFontFamily};

  &:hover {
    color: ${theme.colors.grayDarker};
  }
`;

interface PassedProps {
  dataType: FutureDataType;
  className?: string;
}

interface GeneratedStateProps {
  thresholds: number[];
}

interface GeneratedDispatchProps {
  setThresholds: (values: number | number[]) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

const configurations = {
  stress: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.stress,
    step: 0.01,
    formatter: format('.2f'),
  },
  shortage: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.shortage,
    step: 10,
    formatter: format('d'),
  },
};

function getHeaderText(dataType: FutureDataType) {
  const text =
    dataType === 'shortage'
      ? 'Available water per capita (m³)'
      : 'Consumption relative to availability';
  return (
    <span>
      <strong>{dataType.charAt(0).toUpperCase() + dataType.slice(1)}:</strong>{' '}
      {text}
    </span>
  );
}

// TODO: Replace react-slider with https://github.com/airbnb/rheostat ?

function ThresholdSelector({
  className,
  thresholds,
  dataType,
  setThresholds,
}: Props) {
  const { step, min, max, formatter } = configurations[dataType];
  const slidingMax = Math.max(thresholds[thresholds.length - 1] * 1.1, max);

  // ReactSlider modifies the contents of the values array. We need to clone it
  return (
    <Root className={className}>
      <Header>{getHeaderText(dataType)}</Header>
      <StyledReactSlider
        min={min}
        max={slidingMax}
        value={thresholds.slice()}
        minDistance={10 * step}
        pearling
        step={step}
        withBars
        snapDragDisabled
        handleClassName="threshold-selector-handle"
        handleActiveClassName="threshold-selector-active"
        barClassName={dataType === 'stress' ? 'bar-stress' : 'bar-shortage'}
        onChange={setThresholds}
      />
      <Labels>
        {thresholds.map((d, i) => (
          <Label
            style={{ left: `${((d - min) / (slidingMax - min)) * 100}%` }}
            key={`${dataType}-threshold-label-${i}`}
          >
            {formatter(d)}
          </Label>
        ))}
      </Labels>
      <Reset>
        <ResetLink
          onClick={() => {
            setThresholds(defaultDataTypeThresholds[dataType]);
          }}
        >
          Reset
        </ResetLink>
      </Reset>
    </Root>
  );
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(
  (state, ownProps) => ({
    thresholds: getThresholdsForDataType(state, ownProps.dataType),
  }),
  (dispatch, ownProps) => ({
    setThresholds: (values: number[] | number) => {
      // ReactSlider modifies the contents of the values array
      const thresholds = Array.isArray(values) ? values.slice() : [values];
      dispatch(setThresholdsForDataType(ownProps.dataType, thresholds));
    },
  }),
)(ThresholdSelector);
