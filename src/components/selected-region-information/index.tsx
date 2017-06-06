import { schemePurples, schemeReds } from 'd3-scale-chromatic';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedTimeIndex,
  getTimeSeriesForSelectedRegion,
} from '../../selectors';
import { getDataTypeThresholds, WaterDatum } from '../../types';

// import AvailabilityChart from './availability-chart';
// import ConsumptionChart from './consumption-chart';
// import PopulationChart from './population-chart';
import DataLineChart from './data-line-chart';

const styles = require('./index.scss');

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

    const stressThresholds = getDataTypeThresholds('blueWaterStress');
    const shortageThresholds = getDataTypeThresholds('blueWaterShortage');

    return (
      <div className="col-xs-12 col-md-6 col-lg-3">
        <div className="column">
          <div>
            <h3 className={styles['section-heading']}>
              Food production unit details
            </h3>
            <h4 className={styles.heading}>Blue water stress</h4>
            <p className={styles.description}>Consumption / Availability</p>
            <DataLineChart
              dataType="blueWaterStress"
              dataColor="red"
              thresholds={stressThresholds}
              thresholdColors={[
                'none',
                ...schemeReds[stressThresholds!.length + 1].slice(1),
              ]}
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          <div>
            <h4 className={styles.heading}>Blue water shortage</h4>
            <p className={styles.description}>Availability per person (m³)</p>
            <DataLineChart
              dataType="blueWaterShortage"
              dataColor="purple"
              thresholds={shortageThresholds}
              thresholdColors={[
                'none',
                ...schemePurples[shortageThresholds!.length + 1].slice(1),
              ].reverse()}
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          {/*<div className="col-xs-12 col-m-6">
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
    setTimeIndex: (value: number) => {
      dispatch(setTimeIndex(value));
    },
  };
}

export default connect<GeneratedStateProps, GeneratedDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectedRegionInformation);
