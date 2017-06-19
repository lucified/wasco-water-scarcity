import * as React from 'react';

const spinner = require('./spinner.svg');
const styles = require('./index.scss');

interface Props {}

export default class Spinner extends React.Component<Props, void> {
  public render() {
    return (
      <div className={styles.spinner}>
        <img src={spinner} />
      </div>
    );
  }
}
