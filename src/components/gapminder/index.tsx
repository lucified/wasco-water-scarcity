import { scaleThreshold } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex, toggleSelectedRegion } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getDataByRegion,
  getRegionsInSelectedWorldRegion,
  getSelectedRegion,
  getSelectedTimeIndex,
  getThresholdsForDataType,
} from '../../selectors';
import { getDataTypeColors } from '../../types';

import Gapminder, { Data } from '../generic/gapminder';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  regionsInSelectedWorldRegion: number[];
  selectedRegion?: number;
  data: Data;
  stressThresholds: number[];
  shortageThresholds: number[];
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
  toggleSelectedRegion: (id: string) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

function shortageSelector(data: { [dataType: string]: number[] }) {
  return data.blueWaterShortage;
}

function stressSelector(data: { [dataType: string]: number[] }) {
  return data.blueWaterStress;
}

function populationSelector(data: { [dataType: string]: number[] }) {
  return data.population;
}

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  regionsInSelectedWorldRegion,
  data,
  setTimeIndex,
  toggleSelectedRegion,
  stressThresholds,
  shortageThresholds,
}: Props) {
  function shouldFadeOut(d: { id: string }) {
    return regionsInSelectedWorldRegion.indexOf(Number(d.id)) < 0;
  }

  const stressColorsScale = scaleThreshold<number, string>()
    .domain(stressThresholds!)
    .range(['none', ...getDataTypeColors('stress')]);
  const shortageColorsScale = scaleThreshold<number, string>()
    .domain(shortageThresholds!)
    .range(['none', ...getDataTypeColors('shortage')].reverse());

  return (
    <div className="col-xs-12">
      <Gapminder
        width={1200}
        height={500}
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
    selectedTimeIndex: getSelectedTimeIndex(state),
    selectedRegion: getSelectedRegion(state),
    regionsInSelectedWorldRegion: getRegionsInSelectedWorldRegion(state),
    data: getDataByRegion(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setTimeIndex: (value: number) => {
      dispatch(setTimeIndex(value));
    },
    toggleSelectedRegion: (id: string) => {
      dispatch(toggleSelectedRegion(Number(id)));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(GapminderWrapper);
