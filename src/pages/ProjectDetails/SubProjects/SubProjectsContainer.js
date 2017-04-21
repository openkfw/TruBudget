import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchProjectDetails, storeSubProjectCurrency, showWorkflowDialog, createSubProjectItem, storeSubProjectName, storeSubProjectAmount, storeSubProjectPurpose } from './actions';
import SubProjects from './SubProjects'
import { showSnackBar, storeSnackBarMessage } from '../../Notifications/actions';

import ProjectDetails from './ProjectDetails';

class SubProjectsContainer extends Component {
  componentWillMount() {
    this.props.fetchProjectDetails(this.props.location.pathname.split('/')[2]);
  }

  render() {
    return (
      <div style={{
        width: '74%',
        left: '13%',
        right: '13%',
        top: '150px',
        position: 'absolute',
        zIndex: 1100,
      }}>
        <ProjectDetails {...this.props}  />
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
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message))
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
    subProjectCurrency: state.getIn(['detailview', 'subProjectCurrency'])

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
