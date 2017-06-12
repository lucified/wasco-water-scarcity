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

const styles = require('./time-selector.scss');

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
    case 'blueWaterStress':
      return (
        datum.populationModerateBlueWaterStress +
        datum.populationHighBlueWaterStress
      );
    case 'blueWaterShortage':
      return (
        datum.populationModerateBlueWaterShortage +
        datum.populationHighBlueWaterShortage
      );
  }
  // TODO: be able to store scarcity into state
  return (
    datum.populationOnlyBlueWaterShortage +
    datum.populationOnlyBlueWaterStress +
    datum.populationBlueWaterShortageAndStress
  );
}

function getNotScarcePopulation(
  dataType: DataType,
  datum: AggregateStressShortageDatum,
) {
  switch (dataType) {
    case 'blueWaterStress':
      return datum.populationNoBlueWaterStress;
    case 'blueWaterShortage':
      return datum.populationNoBlueWaterShortage;
  }
  // TODO: be able to store scarcity into state
  return datum.populationNoBlueWaterShortageAndStress;
}

function getScarceColor(dataType: DataType) {
  switch (dataType) {
    case 'blueWaterStress':
      return 'rgb(203, 24, 29)';
    case 'blueWaterShortage':
      return 'rgb(106, 81, 163)';
  }
  // TODO: be able to store scarcity into state
  return 'purple';
}

const yTickFormatter = format('.2s');

function TimeSelector({
  data,
  dataType,
  selectedIndex,
  setSelectedTime,
}: Props) {
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

  function handleHover(item: BarChartDatum) {
    setSelectedTime(item.key);
  }

  function xTickFormatter(i: string) {
    const index = Number(i);
    return `${data[index].startYear}-${data[index].endYear}`;
  }

  return (
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
      onMouseOver={handleHover}
      hideSelectedLabel
    />
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
