import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions/index';
import { DataType } from '../../../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

type Props = GeneratedDispatchProps;

class FutureIntro extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('stress');
  }

  public render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <h1>The future?</h1>
          <p>Placeholder for information text about what to do next</p>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>): GeneratedDispatchProps {
  return {
    setSelectedDataType: (dataType: DataType) => {
      dispatch(setSelectedDataType(dataType));
    },
  };
}

export default connect<{}, GeneratedDispatchProps, undefined>(
  () => ({}),
  mapDispatchToProps,
)(FutureIntro);
