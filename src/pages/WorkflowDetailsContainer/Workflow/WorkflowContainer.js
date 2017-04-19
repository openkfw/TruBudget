import React, { Component } from 'react';
import { connect } from 'react-redux';

import {fetchWorkflowItems, showWorkflowDialog} from './actions';
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
    openWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false))
  };
}

const mapStateToProps = (state) => {
  return {
    workflowItems: state.getIn(['workflow', 'workflowItems']),
    showWorkflow: state.getIn(['workflow', 'showWorkflow'])
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
