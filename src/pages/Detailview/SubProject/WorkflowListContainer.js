import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStreamItems, showWorkflowDialog, createSubProjectItem } from './actions';
import WorkflowList from './WorkflowList'

class FlowListContainer extends Component {
  componentWillMount() {
    this.props.fetchStremItems(this.props.location.pathname.substring(9));
  }

  render() {
    return <WorkflowList {...this.props} />
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchStremItems: (streamName) => dispatch(fetchStreamItems(streamName)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    createSubProjectItem: (parentName, subprojectName) => dispatch(createSubProjectItem(parentName, subprojectName)),
  };
}

const mapStateToProps = (state) => {
  return {
    streamItems: state.getIn(['detailview', 'streamItems']),
    workflowDialogVisible: state.getIn(['detailview', 'workflowDialogVisible']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowListContainer);
