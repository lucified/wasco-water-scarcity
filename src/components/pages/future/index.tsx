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
import { getClimateModels, getImpactModels } from '../../../data';
import { FutureDataset, WaterRegionGeoJSON } from '../../../data/types';
import { StateTree } from '../../../reducers';
import {
  getSelectedClimateModel,
  getSelectedFutureDataForModel,
  getSelectedFutureDataset,
  getSelectedFutureTimeIndex,
  getSelectedImpactModel,
  getWaterRegionData,
} from '../../../selectors';
import { DataType, TimeAggregate } from '../../../types';

import CrossReferences from '../../cross-references';
import DataSelector from '../../data-selector';
import Spinner from '../../generic/spinner';
import Map from '../../map';
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
  selectedFutureDataset: FutureDataset;
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
    } = this.props;

    this.props.setSelectedDataType('stress');
    if (!mapData) {
      this.props.loadFutureData(selectedFutureDataset);
    }

    if (
      selectedClimateModel === 'watch' ||
      selectedImpactModel === 'watergap'
    ) {
      this.props.setSelectedClimateModel(
        getClimateModels().filter(m => m !== 'watch')[0],
      );
      this.props.setSelectedImpactModel(
        getImpactModels().filter(m => m !== 'watergap')[0],
      );
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.selectedFutureDataset !== this.props.selectedFutureDataset) {
      nextProps.loadFutureData(nextProps.selectedFutureDataset);
    }
  }

  public render() {
    const { mapData, waterRegions } = this.props;

    return (
      <div>
        <div className="row between-xs">
          <div
            className={classNames('col-xs-12', 'col-md-6', styles['body-text'])}
          >
            <h1 className={styles['section-header']}>The Future?</h1>
            <p>
              <em>What can we do about this in the future?</em>
            </p>
          </div>
        </div>
        {!waterRegions || !mapData
          ? <div className="row middle-xs">
              <div className="col-xs-12">
                <Spinner />
              </div>
            </div>
          : <div>
              <div className="row">
                <div className="col-xs-12 col-md-6 col-lg-8">
                  <Map
                    width={800}
                    selectedData={mapData}
                    waterRegions={waterRegions}
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-lg-4">
                  <DataSelector hideScarcity />
                  <FutureLineChart />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <WorldRegionSelector />
                </div>
              </div>
            </div>}
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
