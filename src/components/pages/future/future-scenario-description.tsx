import * as React from 'react';
import styled from 'styled-components';

const Assumption = styled.span`
  font-weight: bold;
`;

import { SelectedScen } from '../../../data';

interface PassedProps {
  className?: string;
  estimateLabel: string;
  selectedScen: SelectedScen;
  includeConsumption?: boolean;
}

type Props = PassedProps;

export default function FutureModelDescription({
  className,
  estimateLabel,
  selectedScen,
  includeConsumption,
}: Props) {
  const {
    climateModel,
    impactModel,
    climateExperiment,
    population,
  } = selectedScen;
  if (
    impactModel === undefined ||
    climateExperiment === undefined ||
    climateModel === undefined ||
    population === undefined
  ) {
    return (
      <div>
        Error: Scenario has an unexpected format and cannot be displayed
      </div>
    );
  }
  return (
    <div className={className}>
      This scenario of blue water {estimateLabel} is produced using{' '}
      <Assumption>blue water availability</Assumption>
      {includeConsumption && (
        <span>
          {' '}
          and <Assumption>consumption</Assumption>
        </span>
      )}{' '}
      estimates from the water model <Assumption>{impactModel}</Assumption>,
      driven by climate data from <Assumption>{climateModel}</Assumption> and{' '}
      <Assumption>{climateExperiment}</Assumption> and calculated for{' '}
      <Assumption>food production units</Assumption>. Population estimates are
      from <Assumption>{population}</Assumption>.
    </div>
  );
}
