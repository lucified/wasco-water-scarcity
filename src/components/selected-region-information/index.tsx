import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { getSelectedRegion, getWaterData } from '../../selectors';
import { StateTree } from '../../reducers';
import { WaterDatum } from '../../types';

const styles = require('./index.scss');

interface GeneratedStateProps {
  allData: TimeAggregate[];
  selectedRegion?: number;
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

class SelectedRegionInformation extends React.Component<Props, void> {
  public render() {
    const { selectedRegion } = this.props;

    if (!selectedRegion) {
      return null;
    }

    return <span className={styles.root}>Selected region {selectedRegion}</span>;
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    allData: getWaterData(state),
    selectedRegion: getSelectedRegion(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setTimeIndex: (value: number) => { dispatch(setTimeIndex(value)); },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectedRegionInformation);
