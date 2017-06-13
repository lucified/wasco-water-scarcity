import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedWorldRegion } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedWorldRegion, getWorldRegionData } from '../../selectors';
import { WorldRegion } from '../../types';

const styles = require('./world-region-selector.scss');

interface StateProps {
  selectedWorldRegion: number;
  worldRegions: WorldRegion[];
}

interface DispatchProps {
  onSetWorldRegion: (id: number) => void;
}

type Props = StateProps & DispatchProps;

class WorldRegionSelector extends React.Component<Props, void> {
  private generateClickCallback(id: number) {
    return () => this.props.onSetWorldRegion(id);
  }

  public render() {
    const { selectedWorldRegion, worldRegions } = this.props;

    return (
      <div>
        {[
          { id: 0, name: 'Global', color: 'black' },
          ...worldRegions,
        ].map(({ id, color, name }) =>
          <a
            key={`world-region-selector-${id}`}
            style={{ color }}
            onClick={this.generateClickCallback(id)}
            className={classNames(styles.button, {
              [styles.selected]: selectedWorldRegion === id,
            })}
          >
            {`${name} `}
          </a>,
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StateTree): StateProps => ({
  selectedWorldRegion: getSelectedWorldRegion(state),
  worldRegions: getWorldRegionData(state),
});

const mapDispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  onSetWorldRegion: (id: number) => {
    dispatch(setSelectedWorldRegion(id));
  },
});

export default connect<StateProps, DispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(WorldRegionSelector);
