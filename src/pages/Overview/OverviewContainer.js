import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStreams, showWorkflowDialog, createProject, storeProjectName } from './actions';
import Overview from './Overview';

class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchStreams();
  }

  render() {
    return <Overview {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchStreams: () => dispatch(fetchStreams()),
    createProject: (name, parent) => dispatch(createProject(name, parent)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeProjectName: (name) => dispatch(storeProjectName(name))
  };
}

const mapStateToProps = (state) => {
  return {
    streams: state.getIn(['overview', 'streams']),
    workflowDialogVisible: state.getIn(['overview', 'workflowDialogVisible']),
    projectName: state.getIn(['overview', 'projectName'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewContainer);
