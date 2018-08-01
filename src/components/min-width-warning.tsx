import * as React from 'react';
import styled from 'styled-components';
import responsive from './generic/responsive';
import { Button, theme } from './theme';

const Root = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 100;
`;

const OverlayText = styled.div`
  width: 400px;
  max-width: 100%;
  margin: ${theme.margin(2)} ${theme.margin()} 0;
  text-align: center;
`;

interface Props {
  minWidth: number;
  width: number;
}

interface State {
  cleared: boolean;
}

class MinWidthWarningPlain extends React.Component<Props, State> {
  public state: State = {
    cleared: false,
  };

  public render() {
    const { width, minWidth, children } = this.props;
    const { cleared } = this.state;

    return (
      <Root>
        {!cleared &&
          width < minWidth && (
            <Overlay>
              <OverlayText>
                <p>This tool is optimized to work on wider screens.</p>
                <Button
                  onClick={() => {
                    this.setState({ cleared: true });
                  }}
                >
                  OK
                </Button>
              </OverlayText>
            </Overlay>
          )}
        {children}
      </Root>
    );
  }
}

export const MinWidthWarning = responsive(MinWidthWarningPlain);
