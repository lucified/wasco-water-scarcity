import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../actions';
import { StateTree } from '../reducers';
import { getSelectedTimeIndex, getWaterData } from '../selectors';

const styles = require('./time-selector.scss');

interface GeneratedStateProps {
  selectedIndex: number;
  maxIndex: number;
  currentIndexLabel: string;
}

interface GeneratedDispatchProps {
  setIndex: (value: number) => void;
}

type Props = GeneratedDispatchProps & GeneratedStateProps;

class TimeSelector extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.handleIndexUpdate = this.handleIndexUpdate.bind(this);
  }

  private handleIndexUpdate(e: any) {
    this.props.setIndex(Number(e.target.value));
  }

  public render() {
    const { selectedIndex, maxIndex, currentIndexLabel } = this.props;

    return (
      <div className={styles.root}>
        <input
          type="range"
          onChange={this.handleIndexUpdate}
          value={selectedIndex}
          min={0}
          max={maxIndex}
          step={1}
        />
        <div>{currentIndexLabel}</div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const data = getWaterData(state);
  const selectedIndex = getSelectedTimeIndex(state);
  const currentSelectedData = data[selectedIndex];
  const label = `${currentSelectedData.startYear} - ${currentSelectedData.endYear}`;

  return {
    selectedIndex,
    maxIndex: data.length - 1,
    currentIndexLabel: label,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setIndex: (value: number) => { dispatch(setTimeIndex(value)); },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(TimeSelector);
