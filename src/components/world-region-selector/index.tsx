import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import { setSelectedWorldRegion } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedWorldRegionId, getWorldRegionData } from '../../selectors';
import { WorldRegion } from '../../types';
import { theme } from '../theme';

const RegionsList = styled.div`
  line-height: 2;
  padding: ${theme.margin()} 0;
`;

const Region = styled.a`
  font-size: 0.73rem;
  font-family: ${theme.labelFontFamily}';
  padding: 0.3rem 0.3rem;
  cursor: pointer;
  color: ${({ selected }: { selected: boolean }) =>
    selected ? 'white' : theme.colors.grayDarkest};
  ${({ selected }: { selected: boolean }) =>
    selected ? `background-color: ${theme.colors.grayDarkest};` : ''};
`;

const RegionName = styled.span`
  white-space: nowrap;
`;

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
      <RegionsList>
        {[
          { id: 0, name: 'Global', color: 'black' },
          ...(worldRegions || []),
        ].map(({ id, name }) => (
          <Region
            key={`world-region-selector-${id}`}
            onClick={this.generateClickCallback(id)}
            selected={selectedWorldRegionId === id}
          >
            <RegionName>{name}</RegionName>
          </Region>
        ))}
      </RegionsList>
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
