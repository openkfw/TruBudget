import React, { Component } from 'react';
import { connect } from 'react-redux';

import {fetchWorkflowItems} from './actions';
import Workflow from './Workflow';

class WorkflowContainer extends Component {
  componentWillMount() {
    this.props.fetchWorkflowItems(this.props.location.pathname.split('/')[3]);
  }

  render() {
    return <Workflow {...this.props} />
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),

  };
}

const mapStateToProps = (state) => {
  return {
    workflowItems: state.getIn(['workflow', 'workflowItems']),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
