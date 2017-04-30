import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjects, showWorkflowDialog, createProject, storeProjectName, storeProjectAmount, storeProjectPurpose,storeProjectCurrency} from './actions';
import Overview from './Overview';
import {showSnackBar, storeSnackBarMessage} from '../Notifications/actions';
class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchProjects();
  }

  render() {
    return <Overview {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProjects: () => dispatch(fetchProjects()),
    createProject: (name, amount, purpose, currency) => dispatch(createProject(name, amount,purpose, currency)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeProjectName: (name) => dispatch(storeProjectName(name)),
    storeProjectAmount: (amount) => dispatch(storeProjectAmount(amount)),
    storeProjectPurpose: (purpose) => dispatch(storeProjectPurpose(purpose)),
    storeProjectCurrency: (currency) => dispatch(storeProjectCurrency(currency)),
    openSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message))
  };
}

const mapStateToProps = (state) => {
  return {
    projects: state.getIn(['overview', 'projects']),
    workflowDialogVisible: state.getIn(['overview', 'workflowDialogVisible']),
    projectName: state.getIn(['overview', 'projectName']),
    projectAmount: state.getIn(['overview', 'projectAmount']),
    projectPurpose: state.getIn(['overview', 'projectPurpose']),
    projectCurrency: state.getIn(['overview', 'projectCurrency']),
    loggedInUser: state.getIn(['login', 'loggedInUser'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewContainer);
