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

    &.bar-shortage-0 {
      background: ${shortageColors[0]};
    }

    &.bar-kcal-0 {
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
  lowThreshold: number;
  thresholds: number[];
}

interface GeneratedDispatchProps {
  setLowThreshold: (thresholds: number[]) => (value: number | number[]) => void;
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

function LowThresholdSelector({
  className,
  lowThreshold,
  dataType,
  setLowThreshold,
  thresholds,
  setThresholds,
  style,
}: Props) {
  const { step, min, max, formatter } = configurations[dataType];
  const slidingMax = Math.max(lowThreshold * 1.1, max);

  return (
    <Root style={style} className={className}>
      <Header>{getHeaderText(dataType)}</Header>
      <StyledReactSlider
        min={min}
        max={slidingMax}
        value={lowThreshold}
        pearling
        step={step}
        withBars
        snapDragDisabled
        handleClassName="threshold-selector-handle"
        handleActiveClassName="threshold-selector-active"
        barClassName={getBarClassName(dataType)}
        onChange={setLowThreshold(thresholds)}
      />
      <Labels>
        <Label
          style={{
            left: `${((lowThreshold - min) / (slidingMax - min)) * 100}%`,
          }}
        >
          {formatter(lowThreshold)}
        </Label>
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
  (state, ownProps) => {
    const thresholds = getThresholdsForDataType(state, ownProps.dataType);
    return {
      thresholds,
      lowThreshold: thresholds[ownProps.dataType === 'stress' ? 0 : 2],
    };
  },
  (dispatch, ownProps) => ({
    setLowThreshold: (thresholds: number[]) => (value: number | number[]) => {
      const { dataType } = ownProps;
      let [low, medium, high] = thresholds;
      const newValue = Array.isArray(value) ? value[0] : value;

      if (dataType === 'stress') {
        if (value >= medium) {
          medium = newValue + 10 * configurations.stress.step;
        }
        if (medium >= high) {
          high = medium + 10 * configurations.stress.step;
        }

        dispatch(
          setThresholdsForDataType(ownProps.dataType, [newValue, medium, high]),
        );
      } else {
        if (newValue <= medium) {
          medium = newValue - 10 * configurations[dataType].step;
        }
        if (medium <= low) {
          low = medium - 10 * configurations[dataType].step;
        }

        dispatch(
          setThresholdsForDataType(ownProps.dataType, [low, medium, newValue]),
        );
      }
    },
    setThresholds: (values: number[] | number) => {
      const thresholds = Array.isArray(values) ? values.slice() : [values];
      dispatch(setThresholdsForDataType(ownProps.dataType, thresholds));
    },
  }),
)(LowThresholdSelector);
