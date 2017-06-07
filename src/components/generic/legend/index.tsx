import * as React from 'react';

const styles = require('./index.scss');

export interface LegendItem {
  color: string;
  title: string;
}

interface Props {
  items: LegendItem[];
  reverse?: boolean;
}

export default class Legend extends React.Component<Props, {}> {
  public static defaultProps = {
    reverse: false,
  };

  private getLegendItem(text: string, color: string, index: number) {
    const style = { backgroundColor: color };
    return (
      <div key={index} className={styles['legend-item']}>
        <div className={styles.box} style={style} />
        <div className={styles.title}>{text}</div>
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
