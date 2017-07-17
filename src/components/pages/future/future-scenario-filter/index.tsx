import * as classNames from 'classnames';
import * as React from 'react';
import * as Select from 'react-select';

import 'react-select/dist/react-select.css';
import * as styles from './index.scss';

interface PassedProps {
  className?: string;
  selectedClimateModels: string[];
  climateModels: string[];
  selectedImpactModels: string[];
  impactModels: string[];
  selectedClimateExperiments: string[];
  climateExperiments: string[];
  selectedPopulations: string[];
  populations: string[];
  onImpactModelChange: (models: string[]) => void;
  onClimateModelChange: (models: string[]) => void;
  onClimateExpirementChange: (models: string[]) => void;
  onPopulationChange: (models: string[]) => void;
}

type Props = PassedProps;

function toOptions(values: string[]): Select.Option[] {
  return values.map(value => ({ value, label: value }));
}

function createChangeHandler(callback: (models: string[]) => void) {
  return (options: Select.Option[] | Select.Option | null) => {
    if (Array.isArray(options)) {
      callback(
        options
          .filter(option => option.value)
          .map(option => String(option.value!)),
      );
    } else if (options) {
      callback([String(options.value)]);
    } else {
      callback([]);
    }
  };
}

export default function FutureScenarioFilter({
  selectedClimateExperiments,
  selectedClimateModels,
  selectedImpactModels,
  selectedPopulations,
  impactModels,
  climateExperiments,
  climateModels,
  populations,
  onImpactModelChange,
  onClimateExpirementChange,
  onClimateModelChange,
  onPopulationChange,
  className,
}: Props) {
  return (
    <div className={classNames(styles.content, className)}>
      <div className={styles.parameter}>
        Impact models:
        <Select
          className={styles.dropdown}
          options={toOptions(impactModels)}
          name="Impact models"
          multi
          clearable={false}
          value={selectedImpactModels}
          onChange={createChangeHandler(onImpactModelChange)}
        />
      </div>
      <div className={styles.parameter}>
        Climate models:
        <Select
          className={styles.dropdown}
          options={toOptions(climateModels)}
          name="Climate models"
          clearable={false}
          multi
          value={selectedClimateModels}
          onChange={createChangeHandler(onClimateModelChange)}
        />
      </div>
      <div className={styles.parameter}>
        Climate experiments:
        <Select
          className={styles.dropdown}
          options={toOptions(climateExperiments)}
          name="Climate experiments"
          clearable={false}
          multi
          value={selectedClimateExperiments}
          onChange={createChangeHandler(onClimateExpirementChange)}
        />
      </div>
      <div className={styles.parameter}>
        Population models:
        <Select
          className={styles.dropdown}
          options={toOptions(populations)}
          name="Populations"
          clearable={false}
          multi
          value={selectedPopulations}
          onChange={createChangeHandler(onPopulationChange)}
        />
      </div>
    </div>
  );
}
