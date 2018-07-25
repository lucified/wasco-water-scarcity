import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { saveCSV } from '../../../csv';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateModel,
  getSelectedImpactModel,
  getSelectedTimeScale,
  getStressShortageData,
} from '../../../selectors';
import { StressShortageDatum, TimeAggregate, TimeScale } from '../../../types';
import { theme } from '../../theme';

const Button = styled.button`
  background: none;
  background-color: ${theme.colors.gray};
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  padding: 10px;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.grayDarker};
  }

  &:focus {
    outline: 0;
  }
`;

interface PassedProps {
  className?: string;
}

interface GeneratedStateProps {
  climateModel: string;
  impactModel: string;
  timeScale: TimeScale;
  data?: Array<TimeAggregate<StressShortageDatum>>;
}

type Props = GeneratedStateProps & PassedProps;

function DownloadCSVPlain({
  climateModel,
  impactModel,
  timeScale,
  data,
  className,
}: Props) {
  if (!data) {
    return null;
  }

  return (
    <Button
      className={className}
      onClick={() => {
        saveCSV(climateModel, impactModel, timeScale, data);
      }}
    >
      Download scenario data
    </Button>
  );
}

export const DownloadCSV = connect<
  GeneratedStateProps,
  {},
  PassedProps,
  StateTree
>(state => ({
  climateModel: getSelectedClimateModel(state),
  impactModel: getSelectedImpactModel(state),
  timeScale: getSelectedTimeScale(state),
  data: getStressShortageData(state),
}))(DownloadCSVPlain);
