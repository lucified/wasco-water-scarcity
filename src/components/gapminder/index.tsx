import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getDataByRegion,
  getSelectedRegion,
  getSelectedTimeIndex,
} from '../../selectors';

import Gapminder, { Data } from '../generic/gapminder';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  selectedRegion?: number;
  data: Data;
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

function xSelector(data: { [dataType: string]: number[] }) {
  return data.blueWaterShortage;
}

function ySelector(data: { [dataType: string]: number[] }) {
  return data.blueWaterStress;
}

function sizeSelector(data: { [dataType: string]: number[] }) {
  return data.population;
}

function GapminderWrapper({
  selectedTimeIndex,
  selectedRegion,
  data,
  setTimeIndex,
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
        xSelector={xSelector}
        ySelector={ySelector}
        sizeSelector={sizeSelector}
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
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(GapminderWrapper);
