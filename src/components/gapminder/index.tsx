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
} from '../../selectors';
import { getDataTypeColors, getDataTypeThresholds } from '../../types';

import Gapminder, { Data } from '../generic/gapminder';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  regionsInSelectedWorldRegion: number[];
  selectedRegion?: number;
  data: Data;
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

const stressThresholds = getDataTypeThresholds('stress');
const stressColorsScale = scaleThreshold<number, string>()
  .domain(stressThresholds!)
  .range(['none', ...getDataTypeColors('stress')]);

const shortageThresholds = getDataTypeThresholds('shortage');
const shortageColorsScale = scaleThreshold<number, string>()
  .domain(shortageThresholds!)
  .range(['none', ...getDataTypeColors('shortage')].reverse());

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  regionsInSelectedWorldRegion,
  data,
  setTimeIndex,
  toggleSelectedRegion,
}: Props) {
  function shouldFadeOut(d: { id: string }) {
    return regionsInSelectedWorldRegion.indexOf(Number(d.id)) < 0;
  }

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
