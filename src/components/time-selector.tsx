import { format } from 'd3-format';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedDataType,
  getSelectedTimeIndex,
  getSelectedWorldRegion,
  getTimeSeriesForSelectedGlobalRegion,
  getWorldRegionData,
} from '../selectors';
import {
  AggregateStressShortageDatum,
  DataType,
  getDataTypeColors,
  WorldRegion,
} from '../types';

import BarChart, { BarChartDatum } from './generic/bar-chart/index';

interface GeneratedStateProps {
  selectedIndex: number;
  currentIndexLabel: string;
  data: AggregateStressShortageDatum[];
  dataType: DataType;
  selectedWorldRegion: WorldRegion | undefined;
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function getValues(dataType: DataType, datum: AggregateStressShortageDatum) {
  const emptyColor = '#D2E3E5';
  const colors = [emptyColor, ...getDataTypeColors(dataType)];

  switch (dataType) {
    case 'stress':
      return [
        {
          key: 'Heavy stress',
          total: datum.populationHighBlueWaterStress,
          color: colors[3],
        },
        {
          key: 'Moderate stress',
          total: datum.populationModerateBlueWaterStress,
          color: colors[2],
        },
        {
          key: 'Low stress',
          total: datum.populationLowBlueWaterStress,
          color: colors[1],
        },
        {
          key: 'No stress',
          total: datum.populationNoBlueWaterStress,
          color: colors[0],
        },
      ];
    case 'shortage':
      return [
        {
          key: 'Heavy shortage',
          total: datum.populationHighBlueWaterShortage,
          color: colors[3],
        },
        {
          key: 'Moderate shortage',
          total: datum.populationModerateBlueWaterShortage,
          color: colors[2],
        },
        {
          key: 'Low shortage',
          total: datum.populationLowBlueWaterShortage,
          color: colors[1],
        },
        {
          key: 'No shortage',
          total: datum.populationNoBlueWaterShortage,
          color: colors[0],
        },
      ];
    case 'scarcity':
      return [
        {
          key: 'Stress and shortage',
          total: datum.populationBlueWaterShortageAndStress,
          color: colors[3],
        },
        {
          key: 'Stress only',
          total: datum.populationOnlyBlueWaterStress,
          color: colors[2],
        },
        {
          key: 'Shortage only',
          total: datum.populationOnlyBlueWaterShortage,
          color: colors[1],
        },
        {
          key: 'No scarcity',
          total: datum.populationNoBlueWaterShortageAndStress,
          color: colors[0],
        },
      ];
  }
}

function getTitle(dataType: DataType, worldRegion?: WorldRegion) {
  if (worldRegion == null) {
    return `Global population living in water ${dataType}`;
  }

  return `Population living in water ${dataType} in ${worldRegion.name}`;
}

const yTickFormatter = format('.2s');

function TimeSelector({
  data,
  dataType,
  selectedIndex,
  selectedWorldRegion,
  setSelectedTime,
}: Props) {
  // TODO: don't regenerate on each render
  const barChartData: BarChartDatum[] = data.map((d, i) => ({
    key: i,
    total: d.population,
    values: getValues(dataType, d),
  }));

  function handleHover(item: BarChartDatum) {
    setSelectedTime(item.key);
  }

  function xTickFormatter(i: string) {
    const index = Number(i);
    return `${data[index].startYear}-${data[index].endYear}`;
  }

  return (
    <div>
      {getTitle(dataType, selectedWorldRegion)}
      <BarChart
        data={barChartData}
        height={120}
        marginBottom={20}
        marginRight={0}
        marginTop={5}
        marginLeft={40}
        yTickFormat={yTickFormatter}
        xTickFormat={xTickFormatter}
        selectedIndex={selectedIndex}
        onMouseEnter={handleHover}
        hideSelectedLabel
      />
    </div>
  );
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const data = getTimeSeriesForSelectedGlobalRegion(state);
  const selectedIndex = getSelectedTimeIndex(state);
  const currentSelectedData = data[selectedIndex];
  const label = currentSelectedData.startYear !== currentSelectedData.endYear
    ? `${currentSelectedData.startYear} - ${currentSelectedData.endYear}`
    : String(currentSelectedData.startYear);
  const selectedWorldRegionId = getSelectedWorldRegion(state);

  return {
    selectedIndex,
    currentIndexLabel: label,
    data,
    dataType: getSelectedDataType(state),
    selectedWorldRegion: getWorldRegionData(state).find(
      r => r.id === selectedWorldRegionId,
    ),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedTime: (value: number) => {
      dispatch(setTimeIndex(value));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(TimeSelector);
