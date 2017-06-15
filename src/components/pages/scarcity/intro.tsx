import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setSelectedDataType } from '../../../actions/index';
import { DataType } from '../../../types';

interface GeneratedDispatchProps {
  setSelectedDataType: (dataType: DataType) => void;
}

type Props = GeneratedDispatchProps;

class ScarcityIntro extends React.Component<Props, void> {
  public componentDidMount() {
    this.props.setSelectedDataType('scarcity');
  }

  public render() {
    return (
      <div className="col-xs-12">
        <h1>Water Scarcity</h1>
        <p><em>Placeholder for information about water scarcity</em></p>
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
)(ScarcityIntro);
