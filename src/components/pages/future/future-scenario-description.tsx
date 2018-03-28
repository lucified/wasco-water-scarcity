import * as React from 'react';
import styled from 'styled-components';

const Assumption = styled.span`
  font-weight: bold;
`;

interface PassedProps {
  className?: string;
  estimateLabel: string;
  climateModel: string;
  impactModel: string;
  climateExperiment: string;
  population: string;
  includeConsumption?: boolean;
}

type Props = PassedProps;

export default function FutureModelDescription({
  className,
  estimateLabel,
  climateModel,
  impactModel,
  climateExperiment,
  population,
  includeConsumption,
}: Props) {
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
