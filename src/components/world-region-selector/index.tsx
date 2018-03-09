import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedWorldRegion } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedWorldRegionId, getWorldRegionData } from '../../selectors';
import { WorldRegion } from '../../types';

const styles = require('./index.scss');

interface StateProps {
  selectedWorldRegionId: number;
  worldRegions?: WorldRegion[];
}

interface DispatchProps {
  onSetWorldRegion: (id: number) => void;
}

type Props = StateProps & DispatchProps;

class WorldRegionSelector extends React.Component<Props> {
  private generateClickCallback(id: number) {
    return () =>
      this.props.onSetWorldRegion(
        this.props.selectedWorldRegionId === id ? 0 : id,
      );
  }

  public render() {
    const { selectedWorldRegionId, worldRegions } = this.props;

    return (
      <div className={styles['regions-list']}>
        {[
          { id: 0, name: 'Global', color: 'black' },
          ...(worldRegions || []),
        ].map(({ id, name }) =>
          <a
            key={`world-region-selector-${id}`}
            onClick={this.generateClickCallback(id)}
            className={classNames(styles.region, {
              [styles.selected]: selectedWorldRegionId === id,
            })}
          >
            <span className={styles['region-name']}>
              {name}
            </span>
          </a>,
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StateTree): StateProps => ({
  selectedWorldRegionId: getSelectedWorldRegionId(state),
  worldRegions: getWorldRegionData(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onSetWorldRegion: (id: number) => {
    dispatch(setSelectedWorldRegion(id));
  },
});

export default connect<StateProps, DispatchProps, {}, StateTree>(
  mapStateToProps,
  mapDispatchToProps,
)(WorldRegionSelector);
