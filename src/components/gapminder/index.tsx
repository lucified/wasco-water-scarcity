import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  setTimeRange as setTimeIndexAction,
  toggleSelectedRegion as toggleSelectedRegionAction,
} from '../../actions';
import { getDataTypeColors } from '../../data';
import { StateTree } from '../../reducers';
import {
  getDataByRegion,
  getHistoricalDataTimeIndex,
  getHistoricalDataTimeRanges,
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getThresholdsForDataType,
  getWaterToWorldRegionMap,
} from '../../selectors';

import Gapminder, { Data } from '../generic/gapminder';
import responsive from '../generic/responsive';

function shortageSelector(data: { [dataType: string]: number[] }) {
  return data.shortage;
}

function stressSelector(data: { [dataType: string]: number[] }) {
  return data.stress;
}

function populationSelector(data: { [dataType: string]: number[] }) {
  return data.population;
}

const ResponsiveGapminder = responsive(Gapminder);

interface PassedProps {
  height: number;
}

interface GeneratedStateProps {
  selectedTimeIndex?: number;
  timeRanges?: Array<[number, number]>;
  waterToWorldRegionMap?: { [waterRegionId: number]: number };
  selectedRegion?: number;
  selectedWorldRegionId: number;
  data?: Data;
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  setSelectedTimeRange: (startYear: number, endYear: number) => void;
  toggleSelectedRegion: (id: string) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps & PassedProps;

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  selectedWorldRegionId,
  waterToWorldRegionMap,
  data,
  timeRanges,
  setSelectedTimeRange,
  toggleSelectedRegion,
  stressThresholds,
  shortageThresholds,
  height,
}: Props) {
  if (!waterToWorldRegionMap || !data || selectedTimeIndex == null) {
    return null;
  }

  function shouldFadeOut(d: { id: string }) {
    if (
      selectedWorldRegionId === 0 ||
      waterToWorldRegionMap![Number(d.id)] === selectedWorldRegionId
    ) {
      return false;
    }
    return true;
  }

  const stressColorsScale = scaleThreshold<number, string>()
    .domain(stressThresholds!)
    .range(['none', ...getDataTypeColors('stress')]);
  const shortageColorsScale = scaleThreshold<number, string>()
    .domain(shortageThresholds!)
    .range(['none', ...getDataTypeColors('shortage')].reverse());

  return (
    <div>
      <ResponsiveGapminder
        height={height}
        data={data}
        selectedTimeIndex={selectedTimeIndex}
        selectedData={
          selectedRegion != null ? String(selectedRegion) : undefined
        }
        onHover={index => {
          if (!timeRanges) {
            return;
          }
          const selectedRange = timeRanges[index];
          setSelectedTimeRange(selectedRange[0], selectedRange[1]);
        }}
        onClick={toggleSelectedRegion}
        xSelector={shortageSelector}
        xBackgroundColorScale={shortageColorsScale}
        minX={100}
        maxX={10000}
        minY={0.01}
        maxY={4}
        xAxisLabel="Shortage"
        yAxisLabel="Stress"
        marginLeft={38}
        marginRight={0}
        ySelector={stressSelector}
        yBackgroundColorScale={stressColorsScale}
        sizeSelector={populationSelector}
        fadeOut={shouldFadeOut}
      />
    </div>
  );
}

export const ConnectedGapminder = connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps,
  StateTree
>(
  state => ({
    selectedTimeIndex: getHistoricalDataTimeIndex(state),
    timeRanges: getHistoricalDataTimeRanges(state),
    selectedRegion: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    waterToWorldRegionMap: getWaterToWorldRegionMap(state),
    data: getDataByRegion(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  }),
  dispatch => ({
    setSelectedTimeRange: (startYear: number, endYear: number) => {
      dispatch(setTimeIndexAction(startYear, endYear));
    },
    toggleSelectedRegion: (id: string) => {
      dispatch(toggleSelectedRegionAction(Number(id)));
    },
  }),
)(GapminderWrapper);
