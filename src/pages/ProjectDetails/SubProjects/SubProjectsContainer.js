import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjectDetails, storeSubProjectCurrency, showWorkflowDialog, createSubProjectItem, storeSubProjectName, storeSubProjectAmount, storeSubProjectPurpose } from './actions';
import { setProjectCreationStep } from '../../Overview/actions';
import SubProjects from './SubProjects'
import { showSnackBar, storeSnackBarMessage, showHistory, fetchHistoryItems } from '../../Notifications/actions';
import { setSelectedView } from '../../Navbar/actions';
import ProjectDetails from './ProjectDetails';

class SubProjectsContainer extends Component {
  componentWillMount() {
    const projectId = this.props.location.pathname.split('/')[2];
    this.props.fetchProjectDetails(projectId);
    this.props.fetchHistoryItems(projectId);
    this.props.setSelectedView(projectId, 'project');
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <ProjectDetails {...this.props} />
        <SubProjects {...this.props} />
      </div>
    )
  }
};


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchProjectDetails: (project) => dispatch(fetchProjectDetails(project)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeSubProjectName: (name) => dispatch(storeSubProjectName(name)),
    createSubProjectItem: (subprojectName, amount, purpose, currency, parentName) => dispatch(createSubProjectItem(parentName, subprojectName, amount, purpose, currency)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectPurpose: (purpose) => dispatch(storeSubProjectPurpose(purpose)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    fetchHistoryItems: (project) => dispatch(fetchHistoryItems(project)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    setProjectCreationStep: (step) => dispatch(setProjectCreationStep(step))
  };
}

const mapStateToProps = (state) => {
  return {
    projectName: state.getIn(['detailview', 'projectName']),
    projectAmount: state.getIn(['detailview', 'projectAmount']),
    projectPurpose: state.getIn(['detailview', 'projectPurpose']),
    subProjects: state.getIn(['detailview', 'subProjects']).toJS(),
    workflowDialogVisible: state.getIn(['detailview', 'workflowDialogVisible']),
    subProjectName: state.getIn(['detailview', 'subProjectName']),
    subProjectAmount: state.getIn(['detailview', 'subProjectAmount']),
    subProjectPurpose: state.getIn(['detailview', 'subProjectPurpose']),
    subProjectCurrency: state.getIn(['detailview', 'subProjectCurrency']),
    showHistory: state.getIn(['notifications', 'showHistory']),
    historyItems: state.getIn(['notifications', 'historyItems']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    users: state.getIn(['login', 'users']),
    creationStep: state.getIn(['overview', 'creationStep'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
