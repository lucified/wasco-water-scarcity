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
import { AnyDataType, Diff } from '../types';
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
  font-size: 14px;
`;

const stressColors = getDataTypeColors('stress');
const shortageColors = getDataTypeColors('shortage');
const kcalColors = getDataTypeColors('kcal');

const StyledReactSlider = styled(ReactSlider)`
  width: 100%;
  height: 18px;

  & .bar-stress,
  & .bar-shortage,
  & .bar-kcal {
    position: relative;
    top: 2px;
    background: #d2e3e5;
    height: 10px;
    border-radius: 5px;
    margin: 0 1px;

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

    &.bar-kcal-0 {
      background: ${kcalColors[2]};
    }

    &.bar-kcal-1 {
      background: ${kcalColors[1]};
    }

    &.bar-kcal-2 {
      background: ${kcalColors[0]};
    }
  }

  & .threshold-selector-handle {
    background-color: #aaa;
    cursor: pointer;
    width: 14px;
    height: 14px;
    border-radius: 7px;
    border: 2px solid white;
  }

  & .threshold-selector-active {
    border: 3px solid white !important;
  }
`;

const Labels = styled.div`
  position: relative;
  font-size: 12px;
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
  font-size: 12px;
  font-weight: lighter;
  font-family: ${theme.labelFontFamily};

  &:hover {
    color: ${theme.colors.grayDarker};
  }
`;

type SupportedDataTypes = Diff<AnyDataType, 'scarcity'>;

interface PassedProps {
  dataType: SupportedDataTypes;
  style?: React.CSSProperties;
  className?: string;
}

interface GeneratedStateProps {
  thresholds: number[];
}

interface GeneratedDispatchProps {
  setThresholds: (values: number | number[]) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps & PassedProps;

const configurations: {
  [type in SupportedDataTypes]: {
    min: number;
    max: number;
    step: number;
    formatter: (n: number) => string;
  }
} = {
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
  kcal: {
    min: 0,
    max: defaultDataTypeThresholdMaxValues.kcal,
    step: 1,
    formatter: format('d'),
  },
};

function getHeaderText(dataType: SupportedDataTypes) {
  let body;
  let header;
  switch (dataType) {
    case 'stress':
      header = 'Stress';
      body = 'Consumption relative to availability';
      break;
    case 'shortage':
      header = 'Shortage';
      body = 'Available water per capita (m³)';
      break;
    case 'kcal':
      header = 'Food supply';
      body = 'Kcal per person per day';
      break;
  }

  return (
    <span>
      <strong>{header}:</strong> {body}
    </span>
  );
}

function getBarClassName(dataType: SupportedDataTypes) {
  switch (dataType) {
    case 'stress':
      return 'bar-stress';
    case 'shortage':
      return 'bar-shortage';
    case 'kcal':
      return 'bar-kcal';
  }
}

function ThresholdSelector({
  className,
  thresholds,
  dataType,
  setThresholds,
  style,
}: Props) {
  const { step, min, max, formatter } = configurations[dataType];
  const slidingMax = Math.max(thresholds[thresholds.length - 1] * 1.1, max);

  // ReactSlider modifies the contents of the values array. We need to clone it
  return (
    <Root style={style} className={className}>
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
        barClassName={getBarClassName(dataType)}
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
      // NOTE! ReactSlider modifies the contents of the values array
      const thresholds = Array.isArray(values) ? values.slice() : [values];
      dispatch(setThresholdsForDataType(ownProps.dataType, thresholds));
    },
  }),
)(ThresholdSelector);
