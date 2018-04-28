import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../theme';

const SVG = styled.svg`
  cursor: pointer;
  display: inline-block;
  width: 1.3em;
  height: 1.3em;
  float: right;
  stroke-width: 0;
  stroke: ${colors.gray};
  fill: ${colors.gray};
  margin-bottom: -0.3em;

  &:hover {
    stroke: black;
    fill: black;
  }
`;

interface PassedProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

type Props = PassedProps;

class PlayButton extends React.Component<Props> {
  // Icons are from https://icomoon.io/app/
  private getPlayIcon() {
    return (
      // tslint:disable-next-line:max-line-length
      <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM12 9l12 7-12 7z" />
    );
  }

  private getPauseIcon() {
    return (
      // tslint:disable-next-line:max-line-length
      <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM10 10h4v12h-4zM18 10h4v12h-4z" />
    );
  }

  private handleToggle = () => {
    this.props.onToggle();
  };

  public render() {
    const { isPlaying, className } = this.props;

    return (
      <SVG
        className={className}
        onClick={this.handleToggle}
        viewBox="0 0 32 32"
      >
        {isPlaying ? this.getPauseIcon() : this.getPlayIcon()}
      </SVG>
    );
  }
}

export default PlayButton;
