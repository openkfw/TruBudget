import React, { Component } from 'react';
import { connect } from 'react-redux';
import NodeInfosTable from './NodeInfosTable';

class NodeInfosContainer extends Component {

  render() {
    return (
      <div>
        <NodeInfosTable {...this.props} />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

const mapStateToProps = (state) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeInfosContainer);
