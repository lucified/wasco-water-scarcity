import { format } from 'd3-format';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../actions';
import { StateTree } from '../reducers';
import {
  getSelectedDataType,
  getSelectedTimeIndex,
  getTimeSeriesForSelectedGlobalRegion,
} from '../selectors';
import { AggregateStressShortageDatum, DataType } from '../types';

import BarChart, { BarChartDatum } from './generic/bar-chart/index';
import Legend, { LegendItem } from './generic/legend/index';

interface GeneratedStateProps {
  selectedIndex: number;
  currentIndexLabel: string;
  data: AggregateStressShortageDatum[];
  dataType: DataType;
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

function getScarcePopulation(
  dataType: DataType,
  datum: AggregateStressShortageDatum,
) {
  switch (dataType) {
    case 'stress':
      return (
        datum.populationModerateBlueWaterStress +
        datum.populationHighBlueWaterStress
      );
    case 'shortage':
      return (
        datum.populationModerateBlueWaterShortage +
        datum.populationHighBlueWaterShortage
      );
    case 'scarcity':
      return (
        datum.populationOnlyBlueWaterShortage +
        datum.populationOnlyBlueWaterStress +
        datum.populationBlueWaterShortageAndStress
      );
  }

  console.warn('Unknown data type', dataType);
  return 0;
}

function getNotScarcePopulation(
  dataType: DataType,
  datum: AggregateStressShortageDatum,
) {
  switch (dataType) {
    case 'stress':
      return datum.populationNoBlueWaterStress;
    case 'shortage':
      return datum.populationNoBlueWaterShortage;
    case 'scarcity':
      return datum.populationNoBlueWaterShortageAndStress;
  }

  console.warn('Unknown data type', dataType);
  return 0;
}

function getScarceColor(dataType: DataType) {
  switch (dataType) {
    case 'stress':
      return 'rgb(203, 24, 29)';
    case 'shortage':
      return 'rgb(106, 81, 163)';
    case 'scarcity':
      return 'purple';
  }

  console.warn('Unknown data type', dataType);
  return 'black';
}

const yTickFormatter = format('.2s');

function TimeSelector({
  data,
  dataType,
  selectedIndex,
  setSelectedTime,
}: Props) {
  // TODO: don't regenerate on each render
  const barChartData: BarChartDatum[] = data.map((d, i) => ({
    key: i,
    total: d.population,
    values: [
      {
        key: 'Scarce',
        total: getScarcePopulation(dataType, d),
        color: getScarceColor(dataType),
      },
      {
        key: 'Not scarce',
        total: getNotScarcePopulation(dataType, d),
        color: 'lightgray',
      },
    ],
  }));
  const legendItems: LegendItem[] = [
    {
      color: getScarceColor(dataType),
      title: `Population under ${dataType}`,
    },
    {
      color: 'lightgray',
      title: `No ${dataType}`,
    },
  ];

  function handleHover(item: BarChartDatum) {
    setSelectedTime(item.key);
  }

  function xTickFormatter(i: string) {
    const index = Number(i);
    return `${data[index].startYear}-${data[index].endYear}`;
  }

  return (
    <div>
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
      <Legend items={legendItems} />
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

  return {
    selectedIndex,
    currentIndexLabel: label,
    data,
    dataType: getSelectedDataType(state),
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
