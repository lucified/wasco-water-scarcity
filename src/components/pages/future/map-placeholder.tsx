import * as React from 'react';
import styled from 'styled-components';
import responsive from '../../generic/responsive';
import Spinner from '../../generic/spinner';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

interface Props {
  width: number;
}

class MapPlaceholder extends React.Component<Props> {
  public render() {
    const { width } = this.props;
    // The map's height is width/1.9 and the region selector's height is generally 80px.
    // The 3px is from unknown.
    return (
      <Container style={{ width, height: width / 1.9 + 80 + 3 }}>
        <Spinner />
      </Container>
    );
  }
}

export default responsive(MapPlaceholder);
