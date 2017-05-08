import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjects, showWorkflowDialog, createProject, storeProjectName, storeProjectAmount, storeProjectPurpose,storeProjectCurrency, setProjectCreationStep } from './actions';
import Overview from './Overview';
import {showSnackBar, storeSnackBarMessage} from '../Notifications/actions';

import globalStyles from '../../styles';

class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchProjects();
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
    createProject: (name, amount, purpose, currency) => dispatch(createProject(name, amount,purpose, currency)),
    showWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeProjectName: (name) => dispatch(storeProjectName(name)),
    storeProjectAmount: (amount) => dispatch(storeProjectAmount(amount)),
    storeProjectPurpose: (purpose) => dispatch(storeProjectPurpose(purpose)),
    storeProjectCurrency: (currency) => dispatch(storeProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message)),
    setProjectCreationStep: (step) => dispatch(setProjectCreationStep(step))
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
    loggedInUser: state.getIn(['login', 'loggedInUser'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverviewContainer);
