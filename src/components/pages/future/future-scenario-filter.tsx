import { every, values } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {
  allFutureScenarioVariables,
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

const Sticky = require('react-stickynode');

const StyledSticky = styled(Sticky)`
  width: 100%;
`;

const Section = styled.div`
  margin-bottom: ${theme.defaultMargin}px;
  width: 100%;
`;

const StartingPointSelector = styled.div`
  margin-bottom: ${theme.defaultMargin}px;
  width: 100%;
`;

const StartingPointValue = styled.a`
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  width: 100%;
  background-image: ${({ selected }: { selected: boolean }) =>
    selected
      ? 'linear-gradient(-270deg, #25c3c3 5%, #256ec3 100%)'
      : `linear-gradient(-270deg, ${theme.colors.gray} 5%, ${
          theme.colors.gray
        } 100%)`};
  border-radius: 5px;
  text-transform: uppercase;
  color: white;
  padding: 1rem;
  white-space: nowrap;
  display: inline-block;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 1px;
  text-align: center;
  cursor: pointer;
  margin-top: ${theme.defaultMargin}px;

  &:hover {
    background-color: #256ec3;
    background-image: none;
  }
`;

const SubText = styled.div`
  text-transform: none;
  font-weight: normal;
  margin-top: 5px;
`;

const SelectionModeSelector = styled.div`
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  border-bottom: 1px solid ${theme.colors.grayLighter};
`;

const SelectionModeValue = styled.div`
  padding: 1rem;
  flex-grow: 1;
  font-size: 14px;
  text-align: center;
  border-bottom: 3px solid
    ${({ selected }: { selected: boolean }) => (selected ? '#256EC3' : 'white')};
  cursor: pointer;
`;

interface RequiredScenarioValues {
  [varname: string]: string[];
}

export interface RaggedOption extends Option {
  requiredValues?: RequiredScenarioValues;
}

const sections: {
  [sectionTitle: string]: Array<{
    title: string;
    description: string;
    variable: FutureScenarioVariableName;
    options: RaggedOption[];
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
      furtherInformation: <div>Jalava et al.</div>,
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
      furtherInformation: (
        <ul style={{ margin: 0 }}>
          <li>Kummu et al. 2017</li>
          <li>Mueller et al. 2012</li>
          <li>Fader et al. 2013</li>
          <li>Jägermeyr et al. 2016</li>
        </ul>
      ),
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
      furtherInformation: (
        <div>
          <p>
            SSP stands for Shared Socio-economic Pathway, which are scenarios
            developed by the Intergovernmental Panel on Climate Change (IPCC).
            Each scenario is associated with a narrative describing how the
            future could unfold. The scenarios have then been quantified …
          </p>
          <p>
            Water for food is driven only by population when examining potential
            for change, but also by GDP when using pre-designed scenarios.
            Domestic and industrial water use are driven by all three factors.
          </p>
        </div>
      ),
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
        'defined as increases in energy input in 2100 relative to pre-industrial times. ' +
        '(Defined by the selected SSP)',
      variable: 'climateExperiment',
      furtherInformation: (
        <div>
          RCP stands for Representative Concentration Pathways, which are
          defined by the Intergovernmental Panel on Climate Change (IPCC). The
          pathways have different shapes over time, with values in 2100
          representing a range of energy inputs to the Earth’s climate system.
          These energy inputs are usually referred to as radiative forcing - how
          much sunlight is absorbed by the Earth minus the energy it radiates
          into space.
        </div>
      ),
      options: [
        {
          title: 'RCP 4.5',
          description: '+4.5 W/m2 in 2100',
          value: 'rcp4p5',
          requiredValues: { population: ['SSP1'] },
        },
        {
          title: 'RCP 6.0',
          description: '+6.0 W/m2 in 2100',
          value: 'rcp6p0',
          requiredValues: { population: ['SSP2', 'SSP3'] },
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
          description: 'Average across water and climate models',
          value: 'mean',
        },
      ],
    },
    {
      title: 'Climate models',
      description:
        'Temperature and rainfall for each water model comes from two different climate models. ' +
        'We then take the average across both water and climate models',
      variable: 'climateModel',
      options: [
        {
          title: 'GFDL-ESM2M',
          description: 'NOAA Geophysical Fluid Dynamics Laboratory',
          value: 'gfdl-esm2m',
          requiredValues: { impactModel: ['h08', 'pcrglobwb', 'watergap'] },
        },
        {
          title: 'HadGEM2-ES',
          description: 'UK MET office Hadley Centre ',
          value: 'hadgem2-es',
          requiredValues: { impactModel: ['h08', 'pcrglobwb', 'watergap'] },
        },
        {
          title: 'Mean',
          description: 'Average across water and climate models',
          value: 'mean',
          requiredValues: { impactModel: ['mean'] },
        },
      ],
    },
  ],
};

interface ScenarioDependencies {
  [variableName: string]: { [value: string]: RequiredScenarioValues };
}

// Not very nice, but allows dependencies to be given with other variable information
const scenarioDependencies: ScenarioDependencies = {};
values(sections).forEach(section => {
  section.forEach(({ variable, options }) => {
    options.forEach(({ requiredValues, value }) => {
      if (requiredValues) {
        if (!scenarioDependencies[variable]) {
          scenarioDependencies[variable] = {};
        }

        scenarioDependencies[variable][value] = requiredValues;
      }
    });
  });
});

// Scenario must have any combination of the given values for each variable
function scenarioIsInvalid(
  requiredValues: RequiredScenarioValues,
  scenario: FutureScenario,
) {
  return !every(
    requiredValues,
    (vals, varname) =>
      vals.indexOf(scenario[varname as FutureScenarioVariableName]) > -1,
  );
}

function getEnabledScenario(scenario: FutureScenario) {
  const validScenario: FutureScenario = {
    ...scenario,
  };
  // Note: Recursive dependencies are not handled
  Object.keys(scenarioDependencies).forEach(scenvar => {
    const scenarioVariable = scenvar as FutureScenarioVariableName;
    const dependenciesForVariable = scenarioDependencies[scenarioVariable];
    const requiredValues = dependenciesForVariable[scenario[scenarioVariable]];
    if (scenarioIsInvalid(requiredValues, validScenario)) {
      const firstGoodValue = Object.keys(dependenciesForVariable).find(
        val => !scenarioIsInvalid(dependenciesForVariable[val], scenario),
      );
      if (firstGoodValue) {
        validScenario[scenarioVariable] = firstGoodValue;
      } else {
        console.error(
          'Unable to find a valid scenario',
          validScenario,
          scenarioVariable,
        );
      }
    }
  });
  // NOTE: Might not actually be valid if we were unable to find an alternative
  return validScenario;
}

interface PassedProps {
  className?: string;
  selectedScenario: FutureScenario;
  selectedFutureDataset: FutureDataset;
  comparisonVariables: FutureDatasetVariables;
  ensembleData?: FutureEnsembleData;
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
    vals: string[],
  ) => {
    this.props.setComparisonVariables({
      ...this.props.comparisonVariables,
      [field]: vals,
    });
  };

  private handleChangeScenario = (
    field: FutureScenarioVariableName,
    value: string,
  ) => {
    this.props.setScenario(
      getEnabledScenario({
        ...this.props.selectedScenario,
        [field]: value,
      }),
    );
  };

  private handleHoverEnter = (
    hoveredVariable: FutureScenarioVariableName,
    hoveredValue: string,
  ) => {
    const {
      selectedScenario,
      ensembleData,
      setHoveredScenarios,
      comparisonVariables,
    } = this.props;
    if (
      ensembleData &&
      (this.state.hoveredValue !== hoveredValue ||
        this.state.hoveredVariable !== hoveredVariable)
    ) {
      const { selectionMode } = this.state;

      if (
        selectionMode === 'scenario' &&
        // Don't create hover effects for selected scenario
        selectedScenario[hoveredVariable] !== hoveredValue
      ) {
        // Note: switches to enabled scenarios on the basis that hover is a preview of the final result
        // Assumes that user will realise other variables have also changed
        const hoveredScenario = getEnabledScenario({
          ...selectedScenario,
          [hoveredVariable]: hoveredValue,
        });
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
          ensembleData.filter(d =>
            allFutureScenarioVariables.every(variable => {
              const value = d[variable as FutureScenarioVariableName];
              if (variable === hoveredVariable) {
                return value === hoveredValue;
              } else {
                return (
                  comparisonVariables[
                    variable as FutureScenarioVariableName
                  ].indexOf(value) > -1
                );
              }
            }),
          ),
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
      <div className={className}>
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
            <SubText>Make changes to the status quo</SubText>
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
            <SubText>Narrow down from a variety of options</SubText>
          </StartingPointValue>
        </StartingPointSelector>
        <StyledSticky innerZ={9}>
          <SelectionModeSelector>
            <SelectionModeValue
              selected={selectionMode === 'scenario'}
              onClick={() => {
                this.setState({
                  selectionMode: 'scenario',
                });
              }}
            >
              Selected scenario
            </SelectionModeValue>
            <SelectionModeValue
              selected={selectionMode === 'comparisons'}
              onClick={() => {
                this.setState({
                  selectionMode: 'comparisons',
                });
              }}
            >
              Select comparison scenarios
            </SelectionModeValue>
          </SelectionModeSelector>
        </StyledSticky>
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
      </div>
    );
  }
}

export default FutureScenarioFilter;
