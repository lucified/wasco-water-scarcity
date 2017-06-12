import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedTimeIndex,
  getTimeSeriesForSelectedGlobalRegion,
} from '../../selectors';
import { AggregateStressShortageDatum } from '../../types';

const styles = require('./time-selector.scss');

interface GeneratedStateProps {
  selectedIndex: number;
  currentIndexLabel: string;
  data: AggregateStressShortageDatum[];
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

class TimeSelector extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.handleIndexUpdate = this.handleIndexUpdate.bind(this);
  }

  private handleIndexUpdate(e: any) {
    // TODO: fix
    this.props.setSelectedTime(Number(e.target.value));
  }

  public render() {
    const { currentIndexLabel } = this.props;

    return (
      <div className={styles.root}>
        <div>{currentIndexLabel}</div>
      </div>
    );
  }
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
