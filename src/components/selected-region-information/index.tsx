// tslint:disable:jsx-alignment

import { max } from 'd3-array';
import * as React from 'react';
import { connect } from 'react-redux';
import 'react-select/dist/react-select.css';
import Select from 'react-virtualized-select';
import 'react-virtualized-select/styles.css';
import styled from 'styled-components';
import { Option } from '../../../node_modules/@types/react-select';
import {
  setSelectedRegion,
  setTimeRange,
  toggleHistoricalTimeIndexLock,
} from '../../actions';
import { getDataTypeColors, RegionSearchTerms } from '../../data';
import { StateTree } from '../../reducers';
import {
  getHistoricalDataTimeIndex,
  getHistoricalDataTimeRanges,
  getRegionSearchTerms,
  getSelectedWaterRegionId,
  getSelectedWorldRegion,
  getThresholdsForDataType,
  getTimeSeriesForSelectedGlobalRegion,
  getTimeSeriesForSelectedWaterRegion,
  isHistoricalTimeIndexLocked,
} from '../../selectors';
import {
  AggregateStressShortageDatum,
  Datum,
  HistoricalDataType,
  StressShortageDatum,
  WorldRegion,
} from '../../types';
import { ConnectedGapminder } from '../gapminder';
import { SectionHeader, theme } from '../theme';
import AvailabilityChart from './availability-chart';
import ConsumptionChart from './consumption-chart';
import DataLineChart from './data-line-chart';
import PopulationChart from './population-chart';

const Heading = styled.h4`
  margin-top: 0px;
  margin-bottom: 5px;
`;

const Description = styled.p`
  font-size: 0.8rem;
  font-family: ${theme.labelFontFamily};
  color: ${theme.colors.grayDark};
  margin: 0 0 10px 1px;
`;

const Empty = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: left;
  height: 180px;
  font-weight: 200;
  font-family: ${theme.labelFontFamily};
  color: ${theme.colors.gray};
  & > div {
    margin-top: 15px;
  }
`;

interface PassedProps {
  dataType: HistoricalDataType;
}

interface GeneratedStateProps {
  regionSearchTerms?: RegionSearchTerms[];
  selectedTimeIndex?: number;
  timeRanges?: Array<[number, number]>;
  selectedWaterRegionId?: number;
  selectedWorldRegion?: WorldRegion;
  timeSeriesForSelectedWaterRegion?: StressShortageDatum[];
  timeSeriesForSelectedWorldRegion?: AggregateStressShortageDatum[];
  timeIndexLocked: boolean;
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  setTimeRange: (startYear: number, endYear: number) => void;
  toggleTimeIndexLock: () => void;
  selectRegion: (option: Option<number>) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;

class SelectedRegionInformation extends React.Component<Props> {
  private handleTimeIndexChange = (index: number) => {
    const { timeRanges } = this.props;
    if (timeRanges) {
      const selectedRange = timeRanges[index];
      this.props.setTimeRange(selectedRange[0], selectedRange[1]);
    }
  };

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

    return `Blue water ${type}`;
  }

  private getRegionSearchBox() {
    const { regionSearchTerms, selectRegion } = this.props;
    if (!regionSearchTerms) {
      return null;
    }
    return (
      <Empty>
        <div>Select a region</div>
        <Select
          options={regionSearchTerms}
          maxHeight={100}
          style={
            {
              width: '220px',
              'flex-basis': 'auto',
              'flex-grow': 3,
            } as React.CSSProperties
          }
          placeholder="By country, place or river"
          // TODO: Typing
          onChange={selectRegion as any}
        />
      </Empty>
    );
  }

  private getStressChart() {
    const {
      timeSeriesForSelectedWaterRegion,
      stressThresholds,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props;

    return (
      <div className="col-xs-12 col-md-4">
        <Heading>{this.getChartTitle('stress')}</Heading>
        <Description>Consumption / Availability</Description>
        {timeSeriesForSelectedWaterRegion && selectedTimeIndex != null ? (
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
          this.getRegionSearchBox()
        )}
      </div>
    );
  }

  private getShortageChart() {
    const {
      timeSeriesForSelectedWaterRegion,
      shortageThresholds,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props;

    return (
      <div className="col-xs-12 col-md-4">
        <Heading>{this.getChartTitle('shortage')}</Heading>
        <Description>Availability per person (m³)</Description>
        {timeSeriesForSelectedWaterRegion && selectedTimeIndex != null ? (
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
          this.getRegionSearchBox()
        )}
      </div>
    );
  }

  private getAvailabilityChart(maxConsumptionOrAvailability: number) {
    const {
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props;

    return (
      <div className="col-xs-12 col-md-4">
        <Heading>{this.getChartTitle('availability')}</Heading>
        <Description>Total availability (m³)</Description>
        {selectedTimeIndex != null && (
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
        )}
      </div>
    );
  }

  private getConsumptionChart(maxConsumptionOrAvailability: number) {
    const {
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
      selectedTimeIndex,
      toggleTimeIndexLock,
      timeIndexLocked,
    } = this.props;

    return (
      <div className="col-xs-12 col-md-4">
        <Heading>{this.getChartTitle('consumption')}</Heading>
        <Description>Consumption (m³)</Description>
        {selectedTimeIndex != null && (
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
        )}
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
    } = this.props;

    return (
      <div className="col-xs-12 col-md-4">
        <Heading>{this.getChartTitle('population')}</Heading>
        <Description>Population</Description>
        {selectedTimeIndex != null && (
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
        )}
      </div>
    );
  }

  private getGapminderChart() {
    return (
      <div className="col-xs-12 col-md-4">
        <Heading>Stress vs. shortage</Heading>
        <Description>Per region</Description>
        <ConnectedGapminder height={260} />
      </div>
    );
  }

  private getChartsFor(dataType: HistoricalDataType) {
    const {
      timeSeriesForSelectedWaterRegion,
      timeSeriesForSelectedWorldRegion,
    } = this.props;

    const maxConsumptionOrAvailability = max<Datum, number>(
      timeSeriesForSelectedWaterRegion || timeSeriesForSelectedWorldRegion!,
      d => Math.max(d.availability, d.consumptionTotal),
    )!;

    switch (dataType) {
      case 'stress':
        return (
          <>
            {this.getStressChart()}
            {this.getAvailabilityChart(maxConsumptionOrAvailability)}
            {this.getConsumptionChart(maxConsumptionOrAvailability)}
          </>
        );
      case 'shortage':
        return (
          <>
            {this.getShortageChart()}
            {this.getAvailabilityChart(maxConsumptionOrAvailability)}
            {this.getPopulationChart()}
          </>
        );
      case 'scarcity':
        return (
          <>
            {this.getStressChart()}
            {this.getShortageChart()}
            {this.getGapminderChart()}
          </>
        );
    }
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
    const { timeSeriesForSelectedWorldRegion, dataType } = this.props;

    if (!timeSeriesForSelectedWorldRegion) {
      return null;
    }

    return (
      <div className="col-xs-12">
        <SectionHeader>{this.getTitle()}</SectionHeader>
        <div className="row">{this.getChartsFor(dataType)}</div>
      </div>
    );
  }
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(
  state => ({
    regionSearchTerms: getRegionSearchTerms(state),
    selectedTimeIndex: getHistoricalDataTimeIndex(state),
    selectedWaterRegionId: getSelectedWaterRegionId(state),
    selectedWorldRegion: getSelectedWorldRegion(state),
    timeSeriesForSelectedWaterRegion: getTimeSeriesForSelectedWaterRegion(
      state,
    ),
    timeSeriesForSelectedWorldRegion: getTimeSeriesForSelectedGlobalRegion(
      state,
    ),
    timeRanges: getHistoricalDataTimeRanges(state),
    timeIndexLocked: isHistoricalTimeIndexLocked(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  }),
  dispatch => ({
    setTimeRange: (startYear: number, endYear: number) => {
      dispatch(setTimeRange(startYear, endYear));
    },
    toggleTimeIndexLock: () => {
      dispatch(toggleHistoricalTimeIndexLock());
    },
    selectRegion: (option: Option<number>) => {
      dispatch(setSelectedRegion(option.value));
    },
  }),
)(SelectedRegionInformation);
