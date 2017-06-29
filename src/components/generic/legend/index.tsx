import * as classNames from 'classnames';
import * as React from 'react';

const styles = require('./index.scss');

export interface LegendItem {
  color: string;
  title: string;
}

interface Props {
  items: LegendItem[];
  reverse?: boolean;
  onHover?: (title?: string) => void;
}

interface State {
  hoveredItemTitle?: string;
}

export default class Legend extends React.Component<Props, State> {
  public static defaultProps = {
    reverse: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {};

    this.onHoverEnter = this.onHoverEnter.bind(this);
    this.onHoverLeave = this.onHoverLeave.bind(this);
  }

  private onHoverEnter(e: any) {
    const { onHover } = this.props;
    if (onHover) {
      const titleElements = e.target.parentElement.getElementsByClassName(
        styles.title,
      );
      const title = titleElements[0] && titleElements[0].textContent;
      if (title) {
        this.setState({ hoveredItemTitle: title });
        onHover(title);
      } else {
        console.warn('Unknown title', titleElements);
      }
    }
  }

  private onHoverLeave() {
    const { onHover } = this.props;
    if (onHover) {
      this.setState({ hoveredItemTitle: undefined });
      onHover();
    }
  }

  private getLegendItem(text: string, color: string, index: number) {
    const style = { backgroundColor: color };
    const { hoveredItemTitle } = this.state;
    return (
      <div
        key={index}
        className={classNames(styles['legend-item'], {
          [styles.hovered]: text === hoveredItemTitle,
        })}
      >
        <div className={styles.box} style={style} />
        <div className={styles.title}>
          {text}
        </div>
        <div
          className={styles.overlay}
          onMouseEnter={this.onHoverEnter}
          onMouseOut={this.onHoverLeave}
        />
      </div>
    );
  }

  private getLegendItems() {
    const items = this.props.items.map((item, index) =>
      this.getLegendItem(item.title, item.color, index),
    );

    if (this.props.reverse) {
      return items.reverse();
    }

    return items;
  }

  public render() {
    return (
      <div className={styles.legend}>
        {this.getLegendItems()}
      </div>
    );
  }
}
