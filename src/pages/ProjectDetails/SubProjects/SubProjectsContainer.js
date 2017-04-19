import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStreamItems, storeSubProjectCurrency, showWorkflowDialog, createSubProjectItem, storeSubProjectName, storeSubProjectAmount, storeSubProjectPurpose} from './actions';
import SubProjects from './SubProjects'
import {showSnackBar, storeSnackBarMessage} from '../../Notifications/actions';


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
    createSubProjectItem: (parentName, subprojectName, amount, purpose, currency) => dispatch(createSubProjectItem(parentName, subprojectName, amount, purpose, currency)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectPurpose: (purpose) => dispatch(storeSubProjectPurpose(purpose)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar:() => dispatch(showSnackBar(true)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message))
  };
}

const mapStateToProps = (state) => {
  return {
    streamItems: state.getIn(['detailview', 'streamItems']),
    workflowDialogVisible: state.getIn(['detailview', 'workflowDialogVisible']),
    subProjectName: state.getIn(['detailview', 'subProjectName']),
    subProjectAmount: state.getIn(['detailview', 'subProjectAmount']),
    subProjectPurpose: state.getIn(['detailview', 'subProjectPurpose']),
    subProjectCurrency:state.getIn(['detailview', 'subProjectCurrency'])

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectsContainer);
