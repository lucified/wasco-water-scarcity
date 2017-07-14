import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';

import {
  loadFutureData,
  setSelectedClimateModel,
  setSelectedDataType,
  setSelectedImpactModel,
} from '../../../actions';
import {
  getHistoricalClimateModels,
  getHistoricalImpactModels,
} from '../../../data';
import {
  FutureData,
  FutureDataset,
  WaterRegionGeoJSON,
} from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateModel,
  getSelectedDataType,
  getSelectedFutureDataForModel,
  getSelectedFutureDataset,
  getSelectedFutureDatasetData,
  getSelectedFutureTimeIndex,
  getSelectedImpactModel,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, TimeAggregate } from '../../../types';

import CrossReferences from '../../cross-references';
import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
import ModelSelector from '../../model-selector';
import WorldRegionSelector from '../../world-region-selector';
import FutureLineChart from './future-line-chart';

import * as styles from './index.scss';

type PassedProps = RouteComponentProps<void>;

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
  loadFutureData: (dataset: FutureDataset) => void;
  setSelectedImpactModel: (model: string) => void;
  setSelectedClimateModel: (model: string) => void;
}

interface GeneratedStateProps {
  selectedDataType: DataType;
  selectedFutureDataset: FutureDataset;
  selectedFutureData?: FutureData;
  selectedImpactModel: string;
  selectedClimateModel: string;
  mapData?: TimeAggregate<number>;
  waterRegions?: WaterRegionGeoJSON;
}

type Props = PassedProps & GeneratedStateProps & GeneratedDispatchProps;

class FutureBody extends React.Component<Props> {
  public componentDidMount() {
    const {
      mapData,
      selectedFutureDataset,
      selectedClimateModel,
      selectedImpactModel,
      selectedDataType,
    } = this.props;

    if (selectedDataType === 'scarcity') {
      this.props.setSelectedDataType('stress');
    }

    if (!mapData) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    if (
      selectedClimateModel === 'watch' ||
      selectedImpactModel === 'watergap'
    ) {
      this.props.setSelectedClimateModel(
        getHistoricalClimateModels().filter(m => m !== 'watch')[0],
      );
      this.props.setSelectedImpactModel(
        getHistoricalImpactModels().filter(m => m !== 'watergap')[0],
      );
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.selectedFutureDataset !== this.props.selectedFutureDataset &&
      !nextProps.mapData
    ) {
      nextProps.loadFutureData(nextProps.selectedFutureDataset);
    }
  }

  public render() {
    const {
      mapData,
      waterRegions,
      selectedDataType,
      selectedFutureData,
    } = this.props;

    return (
      <div>
        <div className="row between-xs">
          <div
            className={classNames(
              'col-xs-12',
              'col-md-6',
              'col-lg-8',
              styles['body-text'],
            )}
          >
            <h1 className={styles['section-header']}>The Future?</h1>
            <p>
              <em>What can we do about this in the future?</em>
            </p>
            {!waterRegions || !selectedFutureData
              ? <Spinner />
              : !mapData
                ? <div className={styles.error}>
                    No data found for selected model.
                  </div>
                : <div>
                    <Map
                      width={800}
                      selectedData={mapData}
                      waterRegions={waterRegions}
                    />
                    <WorldRegionSelector />
                  </div>}
          </div>
          <div
            className={classNames('col-xs-12', 'col-md-4', styles.selectors)}
          >
            <DataSelector hideScarcity />
            <ModelSelector
              className={styles['secondary-content']}
              estimateLabel={selectedDataType}
              includeConsumption={selectedDataType === 'stress'}
              future
            />
            <FutureLineChart />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <CrossReferences fromPage="future" />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StateTree): GeneratedStateProps {
  const futureData = getSelectedFutureDataForModel(state);
  let mapData: TimeAggregate<number> | undefined;

  if (futureData) {
    const timeIndex = getSelectedFutureTimeIndex(state);
    const { y0: startYear, y1: endYear, regions } = futureData.data[timeIndex];
    mapData = {
      startYear,
      endYear,
      data: regions,
    };
  }

  return {
    mapData,
    waterRegions: getWaterRegionData(state),
    selectedDataType: getSelectedDataType(state),
    selectedFutureData: getSelectedFutureDatasetData(state),
    selectedClimateModel: getSelectedClimateModel(state),
    selectedFutureDataset: getSelectedFutureDataset(state),
    selectedImpactModel: getSelectedImpactModel(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
    setSelectedClimateModel: (model: string) => {
      dispatch(setSelectedClimateModel(model));
    },
    setSelectedImpactModel: (model: string) => {
      dispatch(setSelectedImpactModel(model));
    },
    loadFutureData: (dataset: FutureDataset) => {
      dispatch(loadFutureData(dataset));
    },
  };
}

export default connect<
  GeneratedStateProps,
  GeneratedDispatchProps,
  PassedProps
>(mapStateToProps, mapDispatchToProps)(FutureBody);
