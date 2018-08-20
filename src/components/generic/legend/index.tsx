import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  flex-wrap: wrap;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-family: ${theme.labelFontFamily};
  ${({ hovered }: { hovered: boolean }) =>
    hovered ? `background: #ddd;` : ''};
`;

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const Box = styled.div`
  width: 10px;
  height: 10px;
  margin-left: 10px;
`;

const Title = styled.div`
  padding-left: 5px;
  font-size: 0.7rem;
`;

export interface LegendItem {
  color: string;
  title: string;
}

interface Props {
  items: LegendItem[];
  reverse?: boolean;
  onHover?: (title?: string) => void;
  className?: string;
}

interface State {
  hoveredItemTitle?: string;
}

export default class Legend extends React.Component<Props, State> {
  public state: State = {};

  private onHoverEnter = (e: any) => {
    const { onHover } = this.props;
    if (onHover) {
      const titleElements = e.target.parentElement.getElementsByClassName(
        'legend-item-title',
      );
      const title = titleElements[0] && titleElements[0].textContent;
      if (title) {
        this.setState({ hoveredItemTitle: title });
        onHover(title);
      } else {
        console.warn('Unknown title', titleElements);
      }
    }
  };

  private onHoverLeave = () => {
    const { onHover } = this.props;
    if (onHover) {
      this.setState({ hoveredItemTitle: undefined });
      onHover();
    }
  };

  private getLegendItem(text: string, color: string) {
    const style = { backgroundColor: color };
    const { hoveredItemTitle } = this.state;
    return (
      <Item hovered={text === hoveredItemTitle} key={text}>
        <Box style={style} />
        <Title className="legend-item-title">{text}</Title>
        <Overlay
          onMouseEnter={this.onHoverEnter}
          onMouseOut={this.onHoverLeave}
        />
      </Item>
    );
  }

  private getLegendItems() {
    const items = this.props.items.map(item =>
      this.getLegendItem(item.title, item.color),
    );

    if (this.props.reverse) {
      return items.reverse();
    }

    return items;
  }

  public render() {
    const { className } = this.props;

    return (
      <LegendContainer className={className}>
        {this.getLegendItems()}
      </LegendContainer>
    );
  }
}
