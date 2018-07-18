import * as React from 'react';
import styled from 'styled-components';
import {
  FutureDataset,
  FutureDatasetVariables,
  FutureEnsembleData,
  FutureScenario,
  FutureScenarioVariableName,
  getDefaultComparison,
  isScenarioEqual,
  StartingPoint,
} from '../../../data';
import { Option } from '../../generic/multi-selector';
import { BodyText, SectionHeader, theme } from '../../theme';
import { FutureScenarioFilterVariable } from './future-scenario-filter-variable';

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Section = styled.div`
  margin-bottom: ${theme.defaultMargin * 2}px;
  width: 100%;
`;

const StartingPointSelector = styled.div`
  margin: ${theme.defaultMargin}px auto;
  display: flex;
  justify-content: center;
`;

const StartingPointValue = styled.a`
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  font-size: 14px;
  border-radius: 4px;
  color: ${({ selected }: { selected: boolean }) =>
    selected ? 'white' : theme.colors.text};
  background-color: ${({ selected }: { selected: boolean }) =>
    selected ? 'black' : 'white'};
  text-align: center;
  padding: 10px 20px;
  cursor: pointer;
`;

const sections: {
  [sectionTitle: string]: Array<{
    title: string;
    description: string;
    variable: FutureScenarioVariableName;
    options: Option[];
    furtherInformation?: JSX.Element;
  }>;
} = {
  'Changes to water use': [
    {
      title: 'Diet',
      description:
        'Eating only what we need means less food needs to be produced. ' +
        'Water needed to feed animals means that eating less animal products generally requires less water.',
      variable: 'dietChange',
      options: [
        {
          title: 'Current',
          description: 'Average country diets in 2010',
          value: 'current',
        },
        {
          title: 'Moderate change',
          description: 'Healthy diet with only 25% protein from animal sources',
          value: 'medium',
        },
        {
          title: 'High change',
          description:
            'Healthy diet with only 12.5% protein from animal sources',
          value: 'high',
        },
      ],
    },
    {
      title: 'Food loss and waste',
      description:
        'Not all food produced gets eaten. ' +
        'While they sometimes have other uses, in general, reducing food losses saves water.',
      variable: 'foodLossRed',
      options: [
        {
          title: 'Current',
          description: 'Average regional food losses',
          value: 'current',
        },
        {
          title: 'Moderate change',
          description: '25% loss reduction',
          value: 'medium',
        },
        {
          title: 'High change',
          description: '50% loss reduction',
          value: 'high',
        },
      ],
    },
    {
      title: 'Crop yield',
      description:
        'There is potential to produce more crops with limited changes to water use',
      variable: 'yieldGap',
      options: [
        {
          title: 'Current',
          description: 'Yields in 2010',
          value: 'current',
        },
        {
          title: 'Moderate change',
          description: 'Best yields achieved in similar regions',
          value: 'medium',
        },
        {
          title: 'High change',
          description: 'Crops get right nutrients and water at the right time',
          value: 'high',
        },
      ],
    },
    {
      title: 'Agricultural area',
      description:
        'Increasing agricultural area uses more water, but allows for more food to be produced',
      variable: 'agriExp',
      options: [
        {
          title: 'Current',
          description: 'Only areas used for agriculture in 2010',
          value: 'current',
        },
        {
          title: 'Increased agricultural area',
          description: '10% increase',
          value: 'increase',
        },
      ],
    },
    {
      title: 'How are productivity improvements used?',
      description: 'How are water resources used when they are freed up?',
      variable: 'reuse',
      options: [
        {
          title: 'Meet food demand, minimise water use',
          description: 'How little water could we use?',
          value: 'meetfood',
        },
        {
          title: 'Maximise food production',
          description: 'Keeping water use constant',
          value: 'maxfood',
        },
        {
          title: 'Minimise water use',
          description: 'Keeping food production constant',
          value: 'minwater',
        },
      ],
    },
    {
      title: 'Trade',
      description:
        'How do improvements in production and consumption spread around the world?',
      variable: 'trade',
      options: [
        {
          title: 'None',
          description: 'Can only eat food from the local region',
          value: 'none',
        },
        {
          title: 'Current trade volume',
          description: 'Using volume of trade between regions in 2010',
          value: 'current volume',
        },
      ],
    },
  ],
  'Social uncertainties': [
    {
      title: 'Socio-economic development',
      description:
        'Water use may be influenced by population, GDP, and changes in water use efficiency.',
      variable: 'population',
      options: [
        {
          title: 'SSP1',
          description: 'Sustainability',
          value: 'SSP1',
        },
        {
          title: 'SSP2',
          description: 'Middle of the road',
          value: 'SSP2',
        },
        {
          title: 'SSP3',
          description: 'Regional rivalry ',
          value: 'SSP3',
        },
      ],
    },
    {
      title: 'Climate',
      description:
        'Estimated temperature and rainfall for different greenhouse gas concentrations, ' +
        'defined as increases in energy input in 2100 relative to pre-industrial times',
      variable: 'climateExperiment',
      options: [
        {
          title: 'RCP 4.5',
          description: '+4.5 W/m2 in 2100',
          value: 'rcp4p5',
        },
        {
          title: 'RCP 6.0',
          description: '+6.0 W/m2 in 2100',
          value: 'rcp6p0',
        },
        {
          title: 'RCP 8.5',
          description: '+8.5 W/m2 in 2100',
          value: 'rcp8p5',
        },
      ],
    },
    {
      title: 'Water allocation',
      description:
        'Available water is divided up between regions sharing a river',
      variable: 'alloc',
      options: [
        {
          title: 'Discharge',
          description: 'More water for regions with high flows',
          value: 'discharge',
        },
        {
          title: 'Runoff',
          description: 'Local rainfall only - no water from upstream',
          value: 'runoff',
        },
      ],
    },
  ],
  'Scientific uncertainties': [
    {
      title: 'Water models',
      description:
        'We use three different global water models, ' +
        'which use different methods to estimate water availability and use.',
      variable: 'impactModel',
      options: [
        {
          title: 'H08',
          description: 'Japanese National Institute for Environmental Studies',
          value: 'h08',
        },
        {
          title: 'PCR-GlobWB',
          description: 'Utrecht University',
          value: 'pcrglobwb',
        },
        {
          title: 'WaterGAP',
          description: 'University of Kassel',
          value: 'watergap',
        },
        {
          title: 'Mean',
          description: 'The mean value of the different models',
          value: 'mean',
        },
      ],
    },
    {
      title: 'Climate models',
      description: 'TODO',
      variable: 'climateModel',
      options: [
        {
          title: 'GFDL-ESM2M',
          description: 'NOAA Geophysical Fluid Dynamics Laboratory',
          value: 'gfdl-esm2m',
        },
        {
          title: 'HadGEM2-ES',
          description: 'UK MET office Hadley Centre ',
          value: 'hadgem2-es',
        },
        {
          title: 'Mean',
          description: 'The mean value of the different models',
          value: 'mean',
        },
      ],
    },
  ],
};

interface PassedProps {
  className?: string;
  selectedScenario: FutureScenario;
  selectedFutureDataset: FutureDataset;
  comparisonVariables: FutureDatasetVariables;
  ensembleData: FutureEnsembleData;
  setScenario: (scenario: FutureScenario) => void;
  setComparisonVariables: (variables: FutureDatasetVariables) => void;
  setHoveredScenarios: (scenarios?: FutureEnsembleData) => void;
}

type Props = PassedProps;

interface State {
  selectedStartingPoint: StartingPoint;
  selectionMode: 'scenario' | 'comparisons';
  hoveredVariable?: FutureScenarioVariableName;
  hoveredValue?: string;
}

class FutureScenarioFilter extends React.Component<Props, State> {
  public state: State = {
    selectedStartingPoint: StartingPoint.CHANGE_THE_WORLD,
    selectionMode: 'scenario',
  };

  private handleChangeComparison = (
    field: FutureScenarioVariableName,
    values: string[],
  ) => {
    this.props.setComparisonVariables({
      ...this.props.comparisonVariables,
      [field]: values,
    });
  };

  private handleChangeScenario = (
    field: FutureScenarioVariableName,
    value: string,
  ) => {
    this.props.setScenario({
      ...this.props.selectedScenario,
      [field]: value,
    });
  };

  private handleHoverEnter = (
    hoveredVariable: FutureScenarioVariableName,
    hoveredValue: string,
  ) => {
    if (
      this.state.hoveredValue !== hoveredValue ||
      this.state.hoveredVariable !== hoveredVariable
    ) {
      const { selectionMode } = this.state;
      const {
        selectedScenario,
        ensembleData,
        setHoveredScenarios,
      } = this.props;

      if (
        selectionMode === 'scenario' &&
        // Don't create hover effects for selected scenario
        selectedScenario[hoveredVariable] !== hoveredValue
      ) {
        const hoveredScenario = {
          ...selectedScenario,
          [hoveredVariable]: hoveredValue,
        };
        const hoveredScenarioWithData = ensembleData.find(d =>
          isScenarioEqual(d, hoveredScenario),
        );
        if (!hoveredScenarioWithData) {
          console.error('Unable to find data for hovered scenario');
        } else {
          setHoveredScenarios([hoveredScenarioWithData]);
        }
        this.setState({ hoveredValue, hoveredVariable });
      } else if (selectionMode === 'comparisons') {
        setHoveredScenarios(
          ensembleData.filter(d => d[hoveredVariable] === hoveredValue),
        );
        this.setState({ hoveredValue, hoveredVariable });
      }
    }
  };

  private handleHoverLeave = (
    hoveredVariable: FutureScenarioVariableName,
    hoveredValue: string,
  ) => {
    if (
      this.state.hoveredValue === hoveredValue ||
      this.state.hoveredVariable === hoveredVariable
    ) {
      this.setState({ hoveredValue: undefined, hoveredVariable: undefined });
      this.props.setHoveredScenarios(undefined);
    }
  };

  public render() {
    const {
      selectedFutureDataset,
      selectedScenario,
      comparisonVariables,
      className,
    } = this.props;
    const { selectedStartingPoint, selectionMode } = this.state;
    const isMultiselect = selectionMode === 'comparisons';

    return (
      <Main className={className}>
        <BodyText>
          The future depends on the actions we take, with outcomes that are also
          uncertain. We provide two starting points to explore the future of
          water scarcity:
        </BodyText>
        <StartingPointSelector>
          <StartingPointValue
            selected={selectedStartingPoint === StartingPoint.CHANGE_THE_WORLD}
            onClick={() => {
              this.setState({
                selectedStartingPoint: StartingPoint.CHANGE_THE_WORLD,
              });
              this.props.setComparisonVariables(
                getDefaultComparison(StartingPoint.CHANGE_THE_WORLD),
              );
            }}
          >
            Let's change the world
          </StartingPointValue>
          <StartingPointValue
            selected={selectedStartingPoint === StartingPoint.ANYTHING_POSSIBLE}
            onClick={() => {
              this.setState({
                selectedStartingPoint: StartingPoint.ANYTHING_POSSIBLE,
              });
              this.props.setComparisonVariables(
                getDefaultComparison(StartingPoint.ANYTHING_POSSIBLE),
              );
            }}
          >
            Anything is possible
          </StartingPointValue>
        </StartingPointSelector>
        {/* TODO: new styling for selection mode selector */}
        <StartingPointSelector>
          <StartingPointValue
            selected={selectionMode === 'scenario'}
            onClick={() => {
              this.setState({
                selectionMode: 'scenario',
              });
            }}
          >
            Select scenario
          </StartingPointValue>
          <StartingPointValue
            selected={selectionMode === 'comparisons'}
            onClick={() => {
              this.setState({
                selectionMode: 'comparisons',
              });
            }}
          >
            Comparison scenarios
          </StartingPointValue>
        </StartingPointSelector>
        {Object.keys(sections).map(sectionTitle => (
          <Section key={sectionTitle}>
            <SectionHeader>{sectionTitle}</SectionHeader>
            {sections[sectionTitle].map(contents => (
              <FutureScenarioFilterVariable
                key={contents.variable}
                {...contents}
                multiselect={isMultiselect}
                selectedFutureDataset={selectedFutureDataset}
                comparisonVariables={comparisonVariables}
                selectedScenario={selectedScenario}
                onLeaveHoverVariable={this.handleHoverLeave}
                onEnterHoverVariable={this.handleHoverEnter}
                setComparisonVariables={this.handleChangeComparison}
                setSelectedScenario={this.handleChangeScenario}
              />
            ))}
          </Section>
        ))}
      </Main>
    );
  }
}

export default FutureScenarioFilter;
