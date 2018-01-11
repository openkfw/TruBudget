import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjectDetails, storeSubProjectCurrency, showWorkflowDialog, createSubProjectItem, storeSubProjectName, storeSubProjectAmount, storeSubProjectComment } from './actions';
import { setProjectCreationStep } from '../Overview/actions';
import SubProjects from './SubProjects'
import { showSnackBar, storeSnackBarMessage, showHistory, fetchHistoryItems } from '../Notifications/actions';
import { setSelectedView } from '../Navbar/actions';
import ProjectDetails from './ProjectDetails';
import globalStyles from '../../styles';
import { fetchRoles } from '../Login/actions';


class SubProjectsContainer extends Component {
  componentWillMount() {
    const projectId = this.props.location.pathname.split('/')[2];
    this.props.fetchProjectDetails(projectId);
    this.props.fetchHistoryItems(projectId);
    this.props.setSelectedView(projectId, 'project');
    this.props.fetchRoles();
  }

  render() {

    return (
      <div style={globalStyles.innerContainer}>
        <ProjectDetails {...this.props} />
        <SubProjects {...this.props} />
      </div>
    )
  }
}
;


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchProjectDetails: (project) => dispatch(fetchProjectDetails(project)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeSubProjectName: (name) => dispatch(storeSubProjectName(name)),
    createSubProjectItem: (subprojectName, amount, comment, currency, parentName) => dispatch(createSubProjectItem(parentName, subprojectName, amount, comment, currency)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectComment: (comment) => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    fetchHistoryItems: (project) => dispatch(fetchHistoryItems(project)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    setProjectCreationStep: (step) => dispatch(setProjectCreationStep(step)),
    fetchRoles: () => dispatch(fetchRoles())
  };
}

const mapStateToProps = (state) => {
  return {
    projectName: state.getIn(['detailview', 'projectName']),
    projectAmount: state.getIn(['detailview', 'projectAmount']),
    projectComment: state.getIn(['detailview', 'projectComment']),
    projectCurrency: state.getIn(['detailview', 'projectCurrency']),
    projectStatus: state.getIn(['detailview', 'projectStatus']),
    projectTS: state.getIn(['detailview', 'projectTS']),
    projectApprover: state.getIn(['detailview', 'projectApprover']),
    projectAssignee: state.getIn(['detailview', 'projectAssignee']),
    projectBank: state.getIn(['detailview', 'projectBank']),
    subProjects: state.getIn(['detailview', 'subProjects']).toJS(),
    subprojectDialogVisible: state.getIn(['detailview', 'subprojectDialogVisible']),
    subProjectName: state.getIn(['detailview', 'subProjectName']),
    subProjectAmount: state.getIn(['detailview', 'subProjectAmount']),
    subProjectComment: state.getIn(['detailview', 'subProjectComment']),
    subProjectCurrency: state.getIn(['detailview', 'subProjectCurrency']),
    showHistory: state.getIn(['notifications', 'showHistory']),
    historyItems: state.getIn(['notifications', 'historyItems']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    users: state.getIn(['login', 'users']).toJS(),
    creationStep: state.getIn(['overview', 'creationStep']),
    roles: state.getIn(['login', 'roles']).toJS()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
