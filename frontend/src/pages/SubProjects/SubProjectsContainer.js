import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchAllProjectDetails, showSubprojectDialog, onSubprojectDialogCancel, storeSubProjectCurrency, createSubProject, storeSubProjectName, storeSubProjectAmount, storeSubProjectComment, fetchProjectPermissions, showProjectPermissions, grantPermission } from './actions';
import SubProjects from './SubProjects'
import { showSnackBar, storeSnackBarMessage, showHistory } from '../Notifications/actions';
import { setSelectedView } from '../Navbar/actions';
import ProjectDetails from './ProjectDetails';
import globalStyles from '../../styles';
import { toJS } from '../../helper';
import { fetchUser } from '../Login/actions';
import PermissionsContainer from '../Common/Permissions/PermissionsContainer';
import ProjectPermissionsContainer from './ProjectPermissionsContainer';



class SubProjectsContainer extends Component {
  componentWillMount() {
    const projectId = this.props.location.pathname.split('/')[2];
    this.props.setSelectedView(projectId, 'project');
    this.props.fetchAllProjectDetails(projectId, true);
    this.props.fetchUser(true);
  }

  render() {
    const canViewPermissions = this.props.allowedIntents.indexOf("project.intent.list") > -1;
    const canCreateSubProject = this.props.allowedIntents.indexOf("project.createSubproject") > -1;

    return (
      <div>
        <div style={globalStyles.innerContainer}>
          <ProjectPermissionsContainer />
          <ProjectDetails {...this.props} canViewPermissions={canViewPermissions} />
          <SubProjects {...this.props} canCreateSubProject={canCreateSubProject} />
        </div>
      </div>
    )
  }
};


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllProjectDetails: (projectId, showLoading) => dispatch(fetchAllProjectDetails(projectId, showLoading)),
    fetchUser: (showLoading) => dispatch(fetchUser(showLoading)),
    showSubprojectDialog: () => dispatch(showSubprojectDialog()),
    onSubprojectDialogCancel: () => dispatch(onSubprojectDialogCancel()),
    storeSubProjectName: (name) => dispatch(storeSubProjectName(name)),
    createSubProject: (subprojectName, amount, comment, currency, parentName) => dispatch(createSubProject(parentName, subprojectName, amount, comment, currency)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectComment: (comment) => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    showProjectPermissions: () => dispatch(showProjectPermissions())
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
    subProjects: state.getIn(['detailview', 'subProjects']),
    subprojectsDialogVisible: state.getIn(['detailview', 'subprojectsDialogVisible']),
    subProjectName: state.getIn(['detailview', 'subProjectName']),
    subProjectAmount: state.getIn(['detailview', 'subProjectAmount']),
    subProjectComment: state.getIn(['detailview', 'subProjectComment']),
    subProjectCurrency: state.getIn(['detailview', 'subProjectCurrency']),
    showHistory: state.getIn(['notifications', 'showHistory']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    users: state.getIn(['login', 'users']),
    roles: state.getIn(['login', 'roles']),
    user: state.getIn(['login', 'user']),
    allowedIntents: state.getIn(['detailview', 'allowedIntents']),
    thumbnail: state.getIn(['detailview', 'thumbnail']),
    logs: state.getIn(['detailview', 'logs']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectsContainer));
