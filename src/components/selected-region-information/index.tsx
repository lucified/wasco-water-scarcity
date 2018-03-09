// tslint:disable:jsx-alignment

import { max } from 'd3-array';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex, toggleHistoricalTimeIndexLock } from '../../actions';
import { getDataTypeColors } from '../../data';
import { StateTree } from '../../reducers';
import {
  getSelectedHistoricalTimeIndex,
  getSelectedWaterRegionId,
  getSelectedWorldRegion,
  getThresholdsForDataType,
  getTimeSeriesForSelectedGlobalRegion,
  getTimeSeriesForSelectedWaterRegion,
  isHistoricalTimeIndexLocked,
} from '../../selectors';
import {
  AggregateStressShortageDatum,
  DataType,
  Datum,
  StressShortageDatum,
  WorldRegion,
} from '../../types';

import AvailabilityChart from './availability-chart';
import ConsumptionChart from './consumption-chart';
import DataLineChart from './data-line-chart';
import PopulationChart from './population-chart';

const styles = require('./index.scss');

interface PassedProps {
  dataType?: DataType;
}

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedWaterRegionId?: number;
  selectedWorldRegion?: WorldRegion;
  timeSeriesForSelectedWaterRegion?: StressShortageDatum[];
  timeSeriesForSelectedWorldRegion?: AggregateStressShortageDatum[];
  timeIndexLocked: boolean;
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
  toggleTimeIndexLock: () => void;
}

interface DefaultProps {
  dataType: DataType;
}

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;
type PropsWithDefaults = Props & DefaultProps;

class SelectedRegionInformation extends React.Component<Props> {
  public static defaultProps: DefaultProps = {
    dataType: 'scarcity',
  };

  constructor(props: Props) {
    super(props);

    this.handleTimeIndexChange = this.handleTimeIndexChange.bind(this);
  }

  private handleTimeIndexChange(index: number) {
    this.props.setTimeIndex(index);
  }

  private getChartTitle(type: string) {
    const { selectedWaterRegionId, selectedWorldRegion } = this.props;

    if (type === 'population') {
      if (selectedWaterRegionId != null) {
        return 'Region population';
      } else if (selectedWorldRegion) {
        return `Population for ${selectedWorldRegion.name}`;
      }

      return 'Global population';
    }

    if (
      selectedWaterRegionId != null ||
      ['stress', 'shortage'].indexOf(type) > -1
    ) {
      return `Blue water ${type}`;
    }

    if (selectedWorldRegion) {
      return `Blue water ${type} for ${selectedWorldRegion.name}`;
    }

    return `Global blue water ${type}`;
  }

  private getStressChart() {
    const {
      dataType,
      timeSeriesForSelectedWaterRegion,
      stressThresholds,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props as PropsWithDefaults;

    if (['stress', 'scarcity'].indexOf(dataType) < 0) {
      return null;
    }

    const title = this.getChartTitle('stress');

    return (
      <div className="col-xs-12 col-md-4">
        <h4 className={styles.heading}>{title}</h4>
        <p className={styles.description}>Consumption / Availability</p>
        {timeSeriesForSelectedWaterRegion ? (
          <DataLineChart
            dataType="stress"
            dataColor="darkcyan"
            id="stress"
            thresholds={stressThresholds}
            thresholdColors={['none', ...getDataTypeColors('stress')]}
            data={timeSeriesForSelectedWaterRegion}
            selectedTimeIndex={selectedTimeIndex}
            onTimeIndexChange={this.handleTimeIndexChange}
            onClick={toggleTimeIndexLock}
            timeIndexLocked={timeIndexLocked}
          />
        ) : (
          <div className={styles.empty}>Select a unit</div>
        )}
      </div>
    );
  }

  private getShortageChart() {
    const {
      dataType,
      timeSeriesForSelectedWaterRegion,
      shortageThresholds,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props as PropsWithDefaults;

    if (['shortage', 'scarcity'].indexOf(dataType) < 0) {
      return null;
    }

    const title = this.getChartTitle('shortage');

    return (
      <div className="col-xs-12 col-md-4">
        <h4 className={styles.heading}>{title}</h4>
        <p className={styles.description}>Availability per person (m³)</p>
        {timeSeriesForSelectedWaterRegion ? (
          <DataLineChart
            dataType="shortage"
            dataColor="darkcyan"
            thresholds={shortageThresholds}
            thresholdColors={[
              'none',
              ...getDataTypeColors('shortage'),
            ].reverse()}
            id="shortage"
            data={timeSeriesForSelectedWaterRegion}
            selectedTimeIndex={selectedTimeIndex}
            onTimeIndexChange={this.handleTimeIndexChange}
            onClick={toggleTimeIndexLock}
            timeIndexLocked={timeIndexLocked}
          />
        ) : (
          <div className={styles.empty}>Select a unit</div>
        )}
      </div>
    );
  }

  private getAvailabilityChart(maxConsumptionOrAvailability: number) {
    const {
      dataType,
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props as PropsWithDefaults;

    if (['stress', 'shortage'].indexOf(dataType) < 0) {
      return null;
    }

    return (
      <div className="col-xs-12 col-md-4">
        <h4 className={styles.heading}>{this.getChartTitle('availability')}</h4>
        <p className={styles.description}>Total availability (m³)</p>
        <AvailabilityChart
          data={
            timeSeriesForSelectedWaterRegion ||
            timeSeriesForSelectedWorldRegion!
          }
          selectedTimeIndex={selectedTimeIndex}
          onTimeIndexChange={this.handleTimeIndexChange}
          maxY={maxConsumptionOrAvailability}
          onToggleLock={toggleTimeIndexLock}
          timeIndexLocked={timeIndexLocked}
        />
      </div>
    );
  }

  private getConsumptionChart(maxConsumptionOrAvailability: number) {
    const {
      dataType,
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props as PropsWithDefaults;

    if (['stress', 'shortage'].indexOf(dataType) < 0) {
      return null;
    }

    return (
      <div className="col-xs-12 col-md-4">
        <h4 className={styles.heading}>{this.getChartTitle('consumption')}</h4>
        <p className={styles.description}>Consumption (m³)</p>
        <ConsumptionChart
          data={
            timeSeriesForSelectedWaterRegion ||
            timeSeriesForSelectedWorldRegion!
          }
          selectedTimeIndex={selectedTimeIndex}
          onTimeIndexChange={this.handleTimeIndexChange}
          maxY={maxConsumptionOrAvailability}
          onToggleLock={toggleTimeIndexLock}
          timeIndexLocked={timeIndexLocked}
        />
      </div>
    );
  }

  private getPopulationChart() {
    const {
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props as PropsWithDefaults;

    return (
      <div className="col-xs-12 col-md-4">
        <h4 className={styles.heading}>{this.getChartTitle('population')}</h4>
        <p className={styles.description}>Population</p>
        <PopulationChart
          data={
            timeSeriesForSelectedWaterRegion ||
            timeSeriesForSelectedWorldRegion!
          }
          selectedTimeIndex={selectedTimeIndex}
          onTimeIndexChange={this.handleTimeIndexChange}
          onToggleLock={toggleTimeIndexLock}
          timeIndexLocked={timeIndexLocked}
        />
      </div>
    );
  }

  private getTitle() {
    const { selectedWaterRegionId, selectedWorldRegion } = this.props;

    if (selectedWaterRegionId != null) {
      return 'Details for selected food production unit';
    }

    if (selectedWorldRegion) {
      return `Details for ${selectedWorldRegion.name}`;
    }

    return 'Global details';
  }

  public render() {
    const {
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      dataType,
    } = this.props as PropsWithDefaults;

    if (!timeSeriesForSelectedWorldRegion) {
      return null;
    }

    const maxConsumptionOrAvailability = max<Datum, number>(
      timeSeriesForSelectedWaterRegion || timeSeriesForSelectedWorldRegion,
      d => Math.max(d.availability, d.consumptionTotal),
    )!;

    return (
      <div className="col-xs-12 col-md-12 col-lg-12">
        <h3 className={styles['section-heading']}>{this.getTitle()}</h3>
        <div className="row">
          {this.getStressChart()}
          {this.getShortageChart()}
          {this.getAvailabilityChart(maxConsumptionOrAvailability)}
          {dataType === 'shortage'
            ? this.getPopulationChart()
            : this.getConsumptionChart(maxConsumptionOrAvailability)}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedTimeIndex: getSelectedHistoricalTimeIndex(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegion: getSelectedWorldRegion(state),
    timeSeriesForSelectedWaterRegion: getTimeSeriesForSelectedWaterRegion(
      state,
    ),
    timeSeriesForSelectedWorldRegion: getTimeSeriesForSelectedGlobalRegion(
      state,
    ),
    timeIndexLocked: isHistoricalTimeIndexLocked(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setTimeIndex: (value: number) => {
      dispatch(setTimeIndex(value));
    },
    toggleTimeIndexLock: () => {
      dispatch(toggleHistoricalTimeIndexLock());
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(mapStateToProps, mapDispatchToProps)(SelectedRegionInformation);
