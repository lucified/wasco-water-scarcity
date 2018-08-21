import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import { setTimeRange, toggleHistoricalTimeIndexLock } from '../actions';
import { belowThresholdColor, getDataTypeColors } from '../data';
import { StateTree } from '../reducers';
import {
  getHistoricalDataTimeIndex,
  getHistoricalDataTimeRanges,
  getNearestHistoricalTimeRange,
  getSelectedWorldRegion,
  getTimeSeriesForSelectedGlobalRegion,
  isHistoricalTimeIndexLocked,
} from '../selectors';
import {
  AggregateStressShortageDatum,
  HistoricalDataType,
  WorldRegion,
} from '../types';
import { formatPopulation, formatYearRange } from '../utils';
import BarChart, { BarChartDatum } from './generic/bar-chart';
import PlayButton from './generic/play-button';
import responsive, { ResponsiveProps } from './generic/responsive';

const StyledPlayButton = styled(PlayButton)`
  float: right;
`;

function getValues(
  dataType: HistoricalDataType,
  datum: AggregateStressShortageDatum,
) {
  const colors = [belowThresholdColor, ...getDataTypeColors(dataType)];

  switch (dataType) {
    case 'stress':
      return [
        {
          key: 'Heavy stress',
          total: datum.populationHighStress,
          color: colors[3],
        },
        {
          key: 'Moderate stress',
          total: datum.populationModerateStress,
          color: colors[2],
        },
        {
          key: 'Low stress',
          total: datum.populationLowStress,
          color: colors[1],
        },
        {
          key: 'No stress',
          total: datum.populationNoStress,
          color: colors[0],
        },
      ];
    case 'shortage':
      return [
        {
          key: 'Heavy shortage',
          total: datum.populationHighShortage,
          color: colors[3],
        },
        {
          key: 'Moderate shortage',
          total: datum.populationModerateShortage,
          color: colors[2],
        },
        {
          key: 'Low shortage',
          total: datum.populationLowShortage,
          color: colors[1],
        },
        {
          key: 'No shortage',
          total: datum.populationNoShortage,
          color: colors[0],
        },
      ];
    case 'scarcity':
      return [
        {
          key: 'Shortage only',
          total: datum.populationOnlyShortage,
          color: colors[3],
        },
        {
          key: 'Stress and shortage',
          total: datum.populationShortageAndStress,
          color: colors[2],
        },
        {
          key: 'Stress only',
          total: datum.populationOnlyStress,
          color: colors[1],
        },
        {
          key: 'No scarcity',
          total: datum.populationNoShortageAndStress,
          color: colors[0],
        },
      ];
  }
}

function getTitle(dataType: HistoricalDataType, worldRegion?: WorldRegion) {
  if (worldRegion == null) {
    return `Global population living in water ${dataType}`;
  }

  return `Population living in water ${dataType} in ${worldRegion.name}`;
}

interface GeneratedStateProps {
  selectedIndex?: number;
  timeRanges?: Array<[number, number]>;
  currentIndexLabel: string;
  data?: AggregateStressShortageDatum[];
  selectedWorldRegion?: WorldRegion;
  timeIndexLocked: boolean;
}

interface GeneratedDispatchProps {
  setSelectedTime: (startYear: number, endYear: number) => void;
  onToggleLock: () => void;
}

interface PassedProps {
  showPlayButton?: boolean;
  autoplay?: boolean;
  dataType: HistoricalDataType;
}

type Props = GeneratedDispatchProps &
  GeneratedStateProps &
  PassedProps &
  ResponsiveProps;

interface State {
  isPlaying: boolean;
}

class BarChartTimeSelector extends React.PureComponent<Props, State> {
  private timerReference: any;

  public state = {
    isPlaying: false,
  };

  public componentDidMount() {
    const { autoplay, timeRanges, setSelectedTime } = this.props;
    if (autoplay && timeRanges) {
      const firstTimeRange = timeRanges[0];
      setSelectedTime(firstTimeRange[0], firstTimeRange[1]);
      setTimeout(() => {
        this.play();
      }, 2000);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { autoplay, timeRanges, setSelectedTime } = this.props;
    if (autoplay && !prevProps.timeRanges && timeRanges) {
      const firstTimeRange = timeRanges[0];
      setSelectedTime(firstTimeRange[0], firstTimeRange[1]);
      setTimeout(() => {
        this.play();
      }, 2000);
    }
  }

  private generateBarChartData = createSelector(
    (props: Props) => props.data,
    (props: Props) => props.dataType,
    (data, dataType) =>
      data &&
      data.map((d, i) => ({
        key: i,
        total: d.population,
        values: getValues(dataType, d),
      })),
  );

  private handleClick = (item: BarChartDatum) => {
    const { onToggleLock, setSelectedTime, timeRanges } = this.props;
    if (onToggleLock) {
      onToggleLock();
    }
    if (timeRanges) {
      const selectedRange = timeRanges[item.key];
      setSelectedTime(selectedRange[0], selectedRange[1]);
    }
  };

  private handleHover = (item: BarChartDatum) => {
    this.pause();
    const { setSelectedTime, timeRanges } = this.props;
    if (timeRanges) {
      const selectedRange = timeRanges[item.key];
      setSelectedTime(selectedRange[0], selectedRange[1]);
    }
  };

  private handleToggle = () => {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };

  private pause() {
    if (this.timerReference) {
      clearInterval(this.timerReference);
      this.timerReference = null;
    }

    if (this.state.isPlaying) {
      this.setState({ isPlaying: false });
    }
  }

  private play() {
    const { setSelectedTime, selectedIndex, timeRanges } = this.props;
    if (!timeRanges || selectedIndex == null) {
      console.warn('No time information to play.');
      return;
    }
    this.setState({ isPlaying: true });
    const index =
      selectedIndex === timeRanges.length - 1 ? 0 : selectedIndex + 1;
    const selectedRange = timeRanges[index];
    setSelectedTime(selectedRange[0], selectedRange[1]);
    this.timerReference = setInterval(this.setNextPeriod, 1500);
  }

  private setNextPeriod = () => {
    const { setSelectedTime, selectedIndex, timeRanges } = this.props;
    if (!timeRanges || selectedIndex == null) {
      console.warn('No time information to play.');
      return;
    }
    if (selectedIndex === timeRanges.length - 1) {
      this.pause();
    } else {
      const nextRange = timeRanges[selectedIndex + 1];
      setSelectedTime(nextRange[0], nextRange[1]);
    }
  };

  public render() {
    const {
      data,
      dataType,
      selectedIndex,
      selectedWorldRegion,
      timeIndexLocked,
      width,
      showPlayButton,
    } = this.props;
    const { isPlaying } = this.state;

    return (
      <div>
        <h3>
          {getTitle(dataType, selectedWorldRegion)}
          {showPlayButton && (
            <StyledPlayButton
              isPlaying={isPlaying}
              onToggle={this.handleToggle}
            />
          )}
        </h3>
        {!data ? (
          <div style={{ height: 120 + 3, width: '100%' }} />
        ) : (
          <BarChart
            data={this.generateBarChartData(this.props)!}
            height={120}
            marginBottom={20}
            marginRight={0}
            marginTop={5}
            marginLeft={40}
            yTickFormat={formatPopulation}
            xTickFormat={i => {
              const d = data[parseInt(i, 10)];
              // Should have at least 70px per long-form title
              return formatYearRange(d, data.length * 70 < width);
            }}
            selectedIndex={selectedIndex}
            indexLocked={timeIndexLocked}
            onMouseEnter={this.handleHover}
            onClick={this.handleClick}
            hideSelectedLabel
            transitionDuration={100}
          />
        )}
      </div>
    );
  }
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  {},
  StateTree
>(
  state => {
    const selectedIndex = getHistoricalDataTimeIndex(state);
    const selectedRange = getNearestHistoricalTimeRange(state);
    const label = selectedRange
      ? selectedRange[0] !== selectedRange[1]
        ? `${selectedRange[0]} - ${selectedRange[1]}`
        : String(selectedRange[0])
      : '';

    return {
      selectedIndex,
      timeRanges: getHistoricalDataTimeRanges(state),
      currentIndexLabel: label,
      data: getTimeSeriesForSelectedGlobalRegion(state),
      selectedWorldRegion: getSelectedWorldRegion(state),
      timeIndexLocked: isHistoricalTimeIndexLocked(state),
    };
  },
  dispatch => ({
    setSelectedTime: (startYear: number, endYear: number) => {
      dispatch(setTimeRange(startYear, endYear));
    },
    onToggleLock: () => {
      dispatch(toggleHistoricalTimeIndexLock());
    },
  }),
)(responsive(BarChartTimeSelector));
