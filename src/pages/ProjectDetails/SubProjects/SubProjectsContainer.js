import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjectDetails, storeSubProjectCurrency, showWorkflowDialog, createSubProjectItem, storeSubProjectName, storeSubProjectAmount, storeSubProjectPurpose, showHistory, fetchHistoryItems } from './actions';
import SubProjects from './SubProjects'
import { showSnackBar, storeSnackBarMessage } from '../../Notifications/actions';
import ProjectDetails from './ProjectDetails';

class SubProjectsContainer extends Component {
  componentWillMount() {
    this.props.fetchProjectDetails(this.props.location.pathname.split('/')[2]);
    this.props.fetchHistoryItems(this.props.location.pathname.split('/')[2]);
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
    createSubProjectItem: (parentName, subprojectName, amount, purpose, currency) => dispatch(createSubProjectItem(parentName, subprojectName, amount, purpose, currency)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectPurpose: (purpose) => dispatch(storeSubProjectPurpose(purpose)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    fetchHistoryItems:(project) => dispatch(fetchHistoryItems(project))
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
    showHistory: state.getIn(['detailview', 'showHistory']),
    historyItems: state.getIn(['detailview', 'historyItems']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    users: state.getIn(['login', 'users'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
