import { max } from 'd3-array';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setTimeIndex } from '../../actions';
import { StateTree } from '../../reducers';
import {
  getSelectedTimeIndex,
  getThresholdsForDataType,
  getTimeSeriesForSelectedRegion,
} from '../../selectors';
import { getDataTypeColors, StressShortageDatum } from '../../types';

import AvailabilityChart from './availability-chart';
import ConsumptionChart from './consumption-chart';
import DataLineChart from './data-line-chart';

const styles = require('./index.scss');

interface GeneratedStateProps {
  selectedTimeIndex: number;
  timeSeriesForSelectedRegion?: StressShortageDatum[];
  stressThresholds: number[];
  shortageThresholds: number[];
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
    const {
      selectedTimeIndex,
      timeSeriesForSelectedRegion,
      stressThresholds,
      shortageThresholds,
    } = this.props;

    if (!timeSeriesForSelectedRegion) {
      return null;
    }

    const maxConsumptionOrAvailability = max(timeSeriesForSelectedRegion, d =>
      Math.max(d.blueWaterAvailability, d.blueWaterConsumptionTotal),
    );

    return (
      <div className="col-xs-12 col-md-12 col-lg-12">
        <h3 className={styles['section-heading']}>
          Details for selected food production unit
        </h3>
        <div className="row">
          <div className="col-xs-12 col-md-6 col-lg-3">
            <h4 className={styles.heading}>Blue water stress</h4>
            <p className={styles.description}>Consumption / Availability</p>
            <DataLineChart
              dataType="stress"
              dataColor="red"
              thresholds={stressThresholds}
              thresholdColors={['none', ...getDataTypeColors('stress')]}
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          <div className="col-xs-12 col-md-6 col-lg-3">
            <h4 className={styles.heading}>Blue water shortage</h4>
            <p className={styles.description}>Availability per person (m³)</p>
            <DataLineChart
              dataType="shortage"
              dataColor="purple"
              thresholds={shortageThresholds}
              thresholdColors={[
                'none',
                ...getDataTypeColors('shortage'),
              ].reverse()}
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
            />
          </div>
          <div className="col-xs-12 col-md-6 col-lg-3">
            <h4 className={styles.heading}>Blue water availability</h4>
            <p className={styles.description}>Total availability (m³)</p>
            <AvailabilityChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
              maxY={maxConsumptionOrAvailability}
            />
          </div>
          <div className="col-xs-12 col-md-6 col-lg-3">
            <h4 className={styles.heading}>Blue water consumption</h4>
            <p className={styles.description}>Consumption (m³)</p>
            <ConsumptionChart
              data={timeSeriesForSelectedRegion}
              selectedTimeIndex={selectedTimeIndex}
              onTimeIndexChange={this.handleTimeIndexChange}
              maxY={maxConsumptionOrAvailability}
            />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  return {
    selectedTimeIndex: getSelectedTimeIndex(state),
    timeSeriesForSelectedRegion: getTimeSeriesForSelectedRegion(state),
    stressThresholds: getThresholdsForDataType(state, 'stress'),
    shortageThresholds: getThresholdsForDataType(state, 'shortage'),
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
