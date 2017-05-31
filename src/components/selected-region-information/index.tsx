import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedTimeIndex, getTimeSeriesForSelectedRegion } from '../../selectors';
import { WaterDatum } from '../../types';

// import AvailabilityChart from './availability-chart';
// import ConsumptionChart from './consumption-chart';
// import PopulationChart from './population-chart';
import StressShortageChart from './stress-shortage-chart';

interface GeneratedStateProps {
  selectedTimeIndex: number;
  timeSeriesForSelectedRegion?: WaterDatum[];
}

interface GeneratedDispatchProps {
  setTimeIndex: (value: number) => void;
}

type Props = GeneratedStateProps & GeneratedDispatchProps;

class SelectedRegionInformation extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);

    this.handleTimeIndexChange = this.handleTimeIndexChange.bind(this);
  }

  private handleTimeIndexChange(index: number) {
    this.props.setTimeIndex(index);
  }

  public render() {
    const { selectedTimeIndex, timeSeriesForSelectedRegion } = this.props;

    if (!timeSeriesForSelectedRegion) {
      return null;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-m-6">
            <StressShortageChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          {/*<div className="col-xs-12 col-m-6">
            <PopulationChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          <div className="col-xs-12 col-m-6">
            <AvailabilityChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          <div className="col-xs-12 col-m-6">
            <ConsumptionChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div> */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedTimeIndex: getSelectedTimeIndex(state),
    timeSeriesForSelectedRegion: getTimeSeriesForSelectedRegion(state),
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
