import { scaleThreshold } from 'd3-scale';
import { schemePurples, schemeReds } from 'd3-scale-chromatic';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedRegion, setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getDataByRegion,
  getSelectedRegion,
  getSelectedTimeIndex,
} from '../../selectors';
import { getDataTypeThresholds } from '../../types';

import Gapminder, { Data } from '../generic/gapminder';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedRegion?: number;
  data: Data;
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
  setSelectedRegion: (id: string) => void;
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

const stressThresholds = getDataTypeThresholds('blueWaterStress');
const stressColorsScale = scaleThreshold<number, string>()
  .domain(stressThresholds!)
  .range(['none', ...schemeReds[stressThresholds!.length + 1].slice(1)]);

const shortageThresholds = getDataTypeThresholds('blueWaterShortage');
const shortageColorsScale = scaleThreshold<number, string>()
  .domain(shortageThresholds!)
  .range(
    [
      'none',
      ...schemePurples[shortageThresholds!.length + 1].slice(1),
    ].reverse(),
  );

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  data,
  setTimeIndex,
  setSelectedRegion,
}: Props) {
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
        onSelectData={setSelectedRegion}
        xSelector={shortageSelector}
        xBackgroundColorScale={shortageColorsScale}
        minX={100}
        maxX={10000}
        minY={0.01}
        maxY={4}
        ySelector={stressSelector}
        yBackgroundColorScale={stressColorsScale}
        sizeSelector={populationSelector}
      />
    </div>
  );
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedTimeIndex: getSelectedTimeIndex(state),
    selectedRegion: getSelectedRegion(state),
    data: getDataByRegion(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setTimeIndex: (value: number) => {
      dispatch(setTimeIndex(value));
    },
    setSelectedRegion: (id: string) => {
      dispatch(setSelectedRegion(Number(id)));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(GapminderWrapper);
