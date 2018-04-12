import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex, toggleHistoricalTimeIndexLock } from '../actions';
import { getDataTypeColors } from '../data';
import memoize from '../memoize';
import { StateTree } from '../reducers';
import {
  getSelectedHistoricalDataType,
  getSelectedHistoricalTimeIndex,
  getSelectedWorldRegion,
  getTimeSeriesForSelectedGlobalRegion,
  isHistoricalTimeIndexLocked,
} from '../selectors';
import {
  AggregateStressShortageDatum,
  HistoricalDataType,
  WorldRegion,
} from '../types';
import { formatPopulation, formatYearRange } from '../utils';

import BarChart, { BarChartDatum } from './generic/bar-chart';

interface GeneratedStateProps {
  selectedIndex: number;
  currentIndexLabel: string;
  data?: AggregateStressShortageDatum[];
  dataType: HistoricalDataType;
  selectedWorldRegion?: WorldRegion;
  timeIndexLocked: boolean;
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
  onToggleLock: () => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function getValues(
  dataType: HistoricalDataType,
  datum: AggregateStressShortageDatum,
) {
  const emptyColor = '#D2E3E5';
  const colors = [emptyColor, ...getDataTypeColors(dataType)];

  switch (dataType) {
    case 'stress':
      return [
        {
          key: 'Heavy stress',
          total: datum.populationHighStress,
          color: colors[3],
        },
        {
          key: 'Moderate stress',
          total: datum.populationModerateStress,
          color: colors[2],
        },
        {
          key: 'Low stress',
          total: datum.populationLowStress,
          color: colors[1],
        },
        {
          key: 'No stress',
          total: datum.populationNoStress,
          color: colors[0],
        },
      ];
    case 'shortage':
      return [
        {
          key: 'Heavy shortage',
          total: datum.populationHighShortage,
          color: colors[3],
        },
        {
          key: 'Moderate shortage',
          total: datum.populationModerateShortage,
          color: colors[2],
        },
        {
          key: 'Low shortage',
          total: datum.populationLowShortage,
          color: colors[1],
        },
        {
          key: 'No shortage',
          total: datum.populationNoShortage,
          color: colors[0],
        },
      ];
    case 'scarcity':
      return [
        {
          key: 'Stress and shortage',
          total: datum.populationShortageAndStress,
          color: colors[3],
        },
        {
          key: 'Shortage only',
          total: datum.populationOnlyShortage,
          color: colors[2],
        },
        {
          key: 'Stress only',
          total: datum.populationOnlyStress,
          color: colors[1],
        },
        {
          key: 'No scarcity',
          total: datum.populationNoShortageAndStress,
          color: colors[0],
        },
      ];
  }
}

function getTitle(dataType: HistoricalDataType, worldRegion?: WorldRegion) {
  if (worldRegion == null) {
    return `Global population living in water ${dataType}`;
  }

  return `Population living in water ${dataType} in ${worldRegion.name}`;
}

class TimeSelector extends React.PureComponent<Props> {
  private generateBarChartData = memoize(
    (data: AggregateStressShortageDatum[], dataType: HistoricalDataType) =>
      data.map((d, i) => ({
        key: i,
        total: d.population,
        values: getValues(dataType, d),
      })),
  );

  private handleClick = (item: BarChartDatum) => {
    const { onToggleLock, setSelectedTime } = this.props;
    if (onToggleLock) {
      onToggleLock();
    }
    setSelectedTime(item.key);
  };

  public render() {
    const {
      data,
      dataType,
      selectedIndex,
      selectedWorldRegion,
      setSelectedTime,
      timeIndexLocked,
    } = this.props;
    if (!data) {
      return null;
    }

    function handleHover(item: BarChartDatum) {
      setSelectedTime(item.key);
    }

    function xTickFormatter(i: string) {
      const d = data![Number(i)];
      return formatYearRange(d, data!.length <= 20);
    }

    return (
      <div>
        <h3>{getTitle(dataType, selectedWorldRegion)}</h3>
        <BarChart
          data={this.generateBarChartData(data, dataType)}
          height={120}
          marginBottom={20}
          marginRight={0}
          marginTop={5}
          marginLeft={40}
          yTickFormat={formatPopulation}
          xTickFormat={xTickFormatter}
          selectedIndex={selectedIndex}
          indexLocked={timeIndexLocked}
          onMouseEnter={handleHover}
          onClick={this.handleClick}
          hideSelectedLabel
          transitionDuration={100}
        />
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const data = getTimeSeriesForSelectedGlobalRegion(state);
  const selectedIndex = getSelectedHistoricalTimeIndex(state);
  const currentSelectedData = data && data[selectedIndex];
  const label = currentSelectedData
    ? currentSelectedData.startYear !== currentSelectedData.endYear
      ? `${currentSelectedData.startYear} - ${currentSelectedData.endYear}`
      : String(currentSelectedData.startYear)
    : '';

  return {
    selectedIndex,
    currentIndexLabel: label,
    data,
    dataType: getSelectedHistoricalDataType(state),
    selectedWorldRegion: getSelectedWorldRegion(state),
    timeIndexLocked: isHistoricalTimeIndexLocked(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedTime: (value: number) => {
      dispatch(setTimeIndex(value));
    },
    onToggleLock: () => {
      dispatch(toggleHistoricalTimeIndexLock());
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  {},
  StateTree
>(mapStateToProps, mapDispatchToProps)(TimeSelector);
