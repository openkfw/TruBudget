import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  fetchProjects, showWorkflowDialog, createProject, storeProjectName, storeProjectAmount, storeProjectPurpose, storeProjectCurrency, setProjectCreationStep,
  addApproverRole, addAssignmentRole, addBankRole, removeApproverRole, removeAssignmentRole, removeBankRole
} from './actions';
import Overview from './Overview';
import { showSnackBar, storeSnackBarMessage } from '../Notifications/actions';
import { fetchRoles } from '../Login/actions';

import globalStyles from '../../styles';

class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchProjects();
    this.props.fetchRoles();
  }

  render() {
    return (
      <div style={globalStyles.innerContainer}>
        <Overview {...this.props} />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProjects: () => dispatch(fetchProjects()),
    createProject: (name, amount, purpose, currency, _, approver, assignee, bank) => dispatch(createProject(name, amount, purpose, currency, approver, assignee, bank)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeProjectName: (name) => dispatch(storeProjectName(name)),
    storeProjectAmount: (amount) => dispatch(storeProjectAmount(amount)),
    storeProjectPurpose: (purpose) => dispatch(storeProjectPurpose(purpose)),
    storeProjectCurrency: (currency) => dispatch(storeProjectCurrency(currency)),
    addApproverRole: (role) => dispatch(addApproverRole(role)),
    addAssignmentRole: (role) => dispatch(addAssignmentRole(role)),
    addBankRole: (role) => dispatch(addBankRole(role)),
    removeApproverRole: (role) => dispatch(removeApproverRole(role)),
    removeAssignmentRole: (role) => dispatch(removeAssignmentRole(role)),
    removeBankRole: (role) => dispatch(removeBankRole(role)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    setProjectCreationStep: (step) => dispatch(setProjectCreationStep(step)),
    fetchRoles: () => dispatch(fetchRoles())
  };
}

const mapStateToProps = (state) => {
  return {
    projects: state.getIn(['overview', 'projects']),
    creationDialogShown: state.getIn(['overview', 'workflowDialogVisible']),
    creationStep: state.getIn(['overview', 'creationStep']),
    projectName: state.getIn(['overview', 'projectName']),
    projectAmount: state.getIn(['overview', 'projectAmount']),
    projectPurpose: state.getIn(['overview', 'projectPurpose']),
    projectCurrency: state.getIn(['overview', 'projectCurrency']),
    projectApprover: state.getIn(['overview', 'projectApprover']),
    projectAssignee: state.getIn(['overview', 'projectAssignee']),
    projectBank: state.getIn(['overview', 'projectBank']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    roles: state.getIn(['login', 'roles'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewContainer);
