import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { setSelectedWorldRegion } from '../../actions';
import { StateTree } from '../../reducers';
import { getSelectedWorldRegionId, getWorldRegionData } from '../../selectors';
import { WorldRegion } from '../../types';
import { theme } from '../theme';

const RegionsList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: ${theme.margin()} 0;
`;

const Region = styled.div`
  line-height: 1.3;
`;

const RegionLink = styled.a`
  font-size: 0.73rem;
  font-family: ${theme.labelFontFamily};
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  ${({ selected }: { selected: boolean }) =>
    selected
      ? `background-color: ${theme.colors.grayDarkest}; color: white`
      : `color: ${theme.colors.grayDarkest}`};
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
  public render() {
    const { selectedWorldRegionId, worldRegions } = this.props;

    return (
      <RegionsList>
        {[
          { id: 0, name: 'Global', color: 'black' },
          ...(worldRegions || []),
        ].map(({ id, name }) => (
          <Region key={`world-region-selector-${id}`}>
            <RegionLink
              onClick={() =>
                this.props.onSetWorldRegion(
                  this.props.selectedWorldRegionId === id ? 0 : id,
                )
              }
              selected={selectedWorldRegionId === id}
            >
              <RegionName>{name}</RegionName>
            </RegionLink>
          </Region>
        ))}
      </RegionsList>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, StateTree>(
  state => ({
    selectedWorldRegionId: getSelectedWorldRegionId(state),
    worldRegions: getWorldRegionData(state),
  }),
  dispatch => ({
    onSetWorldRegion: (id: number) => {
      dispatch(setSelectedWorldRegion(id));
    },
  }),
)(WorldRegionSelector);
