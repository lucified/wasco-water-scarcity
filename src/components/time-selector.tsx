import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styled from 'styled-components';
import { setTimeIndex, toggleHistoricalTimeIndexLock } from '../actions';
import { belowThresholdColor, getDataTypeColors } from '../data';
import { StateTree } from '../reducers';
import {
  getSelectedHistoricalTimeIndex,
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
  selectedIndex: number;
  currentIndexLabel: string;
  data?: AggregateStressShortageDatum[];
  selectedWorldRegion?: WorldRegion;
  timeIndexLocked: boolean;
}

interface GeneratedDispatchProps {
  setSelectedTime: (value: number) => void;
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

class TimeSelector extends React.PureComponent<Props, State> {
  private timerReference: any;

  public state = {
    isPlaying: false,
  };

  public componentDidMount() {
    if (this.props.autoplay && this.props.data) {
      this.props.setSelectedTime(0);
      setTimeout(() => {
        this.play();
      }, 2000);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.autoplay && !prevProps.data && this.props.data) {
      this.props.setSelectedTime(0);
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
    const { onToggleLock, setSelectedTime } = this.props;
    if (onToggleLock) {
      onToggleLock();
    }
    setSelectedTime(item.key);
  };

  private handleHover = (item: BarChartDatum) => {
    this.pause();
    this.props.setSelectedTime(item.key);
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
    const { setSelectedTime, selectedIndex, data } = this.props;
    if (!data) {
      console.warn('No time information to play.');
      return;
    }
    this.setState({ isPlaying: true });
    if (selectedIndex === data.length - 1) {
      setSelectedTime(0);
    } else {
      setSelectedTime(selectedIndex + 1);
    }
    this.timerReference = setInterval(this.setNextPeriod, 1500);
  }

  private setNextPeriod = () => {
    const { setSelectedTime, selectedIndex, data } = this.props;
    if (!data) {
      console.warn('No time information to play.');
      return;
    }
    if (selectedIndex === data.length - 1) {
      this.pause();
    } else {
      setSelectedTime(selectedIndex + 1);
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
    const data = getTimeSeriesForSelectedGlobalRegion(state);
    const selectedIndex = getSelectedHistoricalTimeIndex(state);
    const currentSelectedData = data && data[selectedIndex];
    const label = currentSelectedData
      ? currentSelectedData.startYear !== currentSelectedData.endYear
        ? `${currentSelectedData.startYear} - ${currentSelectedData.endYear}`
        : String(currentSelectedData.startYear)
      : '';

    return {
      selectedIndex,
      currentIndexLabel: label,
      data,
      selectedWorldRegion: getSelectedWorldRegion(state),
      timeIndexLocked: isHistoricalTimeIndexLocked(state),
    };
  },
  dispatch => ({
    setSelectedTime: (value: number) => {
      dispatch(setTimeIndex(value));
    },
    onToggleLock: () => {
      dispatch(toggleHistoricalTimeIndexLock());
    },
  }),
)(responsive(TimeSelector));
