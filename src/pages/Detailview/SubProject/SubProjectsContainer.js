import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStreamItems, showWorkflowDialog, createSubProjectItem, storeSubProjectName} from './actions';
import SubProjects from './SubProjects'

class SubProjectsContainer extends Component {
  componentWillMount() {
    this.props.fetchStremItems(this.props.location.pathname.substring(9));
  }

  render() {
    return <SubProjects {...this.props} />
  }
};


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchStremItems: (streamName) => dispatch(fetchStreamItems(streamName)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeSubProjectName: (name) => dispatch(storeSubProjectName(name)),
    createSubProjectItem: (parentName, subprojectName) => dispatch(createSubProjectItem(parentName, subprojectName)),
  };
}

const mapStateToProps = (state) => {
  return {
    streamItems: state.getIn(['detailview', 'streamItems']),
    workflowDialogVisible: state.getIn(['detailview', 'workflowDialogVisible']),
    subProjectName: state.getIn(['detailview', 'subProjectName'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
