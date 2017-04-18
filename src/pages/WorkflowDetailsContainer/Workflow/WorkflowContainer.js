import React, { Component } from 'react';
import { connect } from 'react-redux';


import Workflow from './Workflow'

class WorkflowContainer extends Component {
  componentWillMount() {
  }

  render() {
    return <Workflow {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  };
}

const mapStateToProps = (state) => {
  return {


  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
