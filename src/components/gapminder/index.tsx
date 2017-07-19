import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  setTimeIndex as setTimeIndexAction,
  toggleSelectedRegion as toggleSelectedRegionAction,
} from '../../actions';
import { StateTree } from '../../reducers';
import {
  getDataByRegion,
  getSelectedHistoricalTimeIndex,
  getSelectedWaterRegionId,
  getSelectedWorldRegionId,
  getThresholdsForDataType,
  getWaterToWorldRegionMap,
} from '../../selectors';
import { getDataTypeColors } from '../../types';

import Gapminder, { Data } from '../generic/gapminder';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  waterToWorldRegionMap?: { [waterRegionId: number]: number };
  selectedRegion?: number;
  selectedWorldRegionId: number;
  data?: Data;
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
  toggleSelectedRegion: (id: string) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

function shortageSelector(data: { [dataType: string]: number[] }) {
  return data.shortage;
}

function stressSelector(data: { [dataType: string]: number[] }) {
  return data.stress;
}

function populationSelector(data: { [dataType: string]: number[] }) {
  return data.population;
}

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  selectedWorldRegionId,
  waterToWorldRegionMap,
  data,
  setTimeIndex,
  toggleSelectedRegion,
  stressThresholds,
  shortageThresholds,
}: Props) {
  if (!waterToWorldRegionMap || !data) {
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
      <Gapminder
        width={400}
        height={400}
        data={data}
        selectedTimeIndex={selectedTimeIndex}
        selectedData={
          selectedRegion != null ? String(selectedRegion) : undefined
        }
        onHover={setTimeIndex}
        onClick={toggleSelectedRegion}
        xSelector={shortageSelector}
        xBackgroundColorScale={shortageColorsScale}
        minX={100}
        maxX={10000}
        minY={0.01}
        maxY={4}
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

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedTimeIndex: getSelectedHistoricalTimeIndex(state),
    selectedRegion: getSelectedWaterRegionId(state),
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    waterToWorldRegionMap: getWaterToWorldRegionMap(state),
    data: getDataByRegion(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setTimeIndex: (value: number) => {
      dispatch(setTimeIndexAction(value));
    },
    toggleSelectedRegion: (id: string) => {
      dispatch(toggleSelectedRegionAction(Number(id)));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(GapminderWrapper as any);
// For some reason the typings don't allow for a function that can return null
// even though it's allowed.
