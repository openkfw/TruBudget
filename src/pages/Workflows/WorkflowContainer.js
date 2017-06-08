import React, { Component } from 'react';
import { connect } from 'react-redux';

import globalStyles from '../../styles';


import {
  fetchWorkflowItems,
  showWorkflowDialog,
  storeWorkflowAdditionalData,
  storeWorkflowPurpose,
  storeWorkflowCurrency,
  storeWorkflowAmount,
  storeWorkflowName,
  storeWorkflowState,
  storeWorkflowAssignee,
  createWorkflowItem,
  editWorkflowItem,
  disableWorkflowState,
  storeWorkflowTxid,
  showWorkflowDetails,
  setWorkflowCreationStep,
  updateWorkflowSortOnState,
  enableWorkflowSort,
  storeWorkflowType,
  postWorkflowSort,
  enableSubProjectBudgetEdit,
  storeSubProjectAmount,
  postSubProjectEdit
} from './actions';

import { setSelectedView } from '../Navbar/actions';
import { showHistory, fetchHistoryItems } from '../Notifications/actions';
import Workflow from './Workflow';
import SubProjectDetails from './SubProjectDetails'
import { getPermissions } from '../../permissions';



class WorkflowContainer extends Component {
  componentWillMount() {
    const subProjectId = this.props.location.pathname.split('/')[3];
    this.props.fetchWorkflowItems(subProjectId);
    this.props.fetchHistoryItems(subProjectId);
    this.props.setSelectedView(subProjectId, 'subProject');
  }


  render() {
    const { isAssignee, isApprover, isBank } = getPermissions(this.props.loggedInUser, this.props.subProjectDetails);
    return (
      <div style={globalStyles.innerContainer}>
        <SubProjectDetails {...this.props} permissions={{ isAssignee, isApprover, isBank }} />
        <Workflow {...this.props} permissions={{ isAssignee, isApprover, isBank }} />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),
    openWorkflowDialog: (editMode) => dispatch(showWorkflowDialog(true, editMode)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false, false)),
    storeWorkflowAdditionalData: (addData) => dispatch(storeWorkflowAdditionalData(addData)),
    storeWorkflowPurpose: (purpose) => dispatch(storeWorkflowPurpose(purpose)),
    storeWorkflowCurrency: (currency) => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: (amount) => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowName: (name) => dispatch(storeWorkflowName(name)),
    storeWorkflowAssignee: (assignee) => dispatch(storeWorkflowAssignee(assignee)),
    storeWorkflowState: (state) => dispatch(storeWorkflowState(state)),
    storeWorkflowTxid: (txid) => dispatch(storeWorkflowTxid(txid)),
    enableWorkflowState: () => dispatch(disableWorkflowState(false)),
    disableWorkflowState: () => dispatch(disableWorkflowState(true)),
    createWorkflowItem: (stream, workflowName, amount, currency, purpose, addData, state, assignee, workflowType) => dispatch(createWorkflowItem(stream, workflowName, amount, currency, purpose, addData, state, assignee, workflowType)),
    editWorkflowItem: (stream, key, workflowName, amount, currency, purpose, addData, state, assignee, txid, previousState, workflowType) => dispatch(editWorkflowItem(stream, key, workflowName, amount, currency, purpose, addData, state, assignee, txid, previousState, workflowType)),
    openWorkflowDetails: (txid) => dispatch(showWorkflowDetails(true, txid)),
    hideWorkflowDetails: () => dispatch(showWorkflowDetails(false)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    fetchHistoryItems: (subProjectName) => dispatch(fetchHistoryItems(subProjectName)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    setWorkflowCreationStep: (step) => dispatch(setWorkflowCreationStep(step)),
    updateWorkflowSortOnState: (items) => dispatch(updateWorkflowSortOnState(items)),
    enableWorkflowSort: () => dispatch(enableWorkflowSort(true)),
    postWorkflowSort: (streamName, workflowItems) => dispatch(postWorkflowSort(streamName, workflowItems)),
    storeWorkflowType: (value) => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    postSubProjectEdit: (parent, streamName, status, amount) => dispatch(postSubProjectEdit(parent, streamName, status, amount))
  };
}

const mapStateToProps = (state) => {
  return {
    workflowItems: state.getIn(['workflow', 'workflowItems']).toJS(),
    subProjectDetails: state.getIn(['workflow', 'subProjectDetails']).toJS(),
    showWorkflow: state.getIn(['workflow', 'showWorkflow']),
    workflowName: state.getIn(['workflow', 'workflowName']),
    workflowAmount: state.getIn(['workflow', 'workflowAmount']),
    workflowPurpose: state.getIn(['workflow', 'workflowPurpose']),
    workflowAdditionalData: state.getIn(['workflow', 'workflowAdditionalData']),
    workflowCurrency: state.getIn(['workflow', 'workflowCurrency']),
    workflowState: state.getIn(['workflow', 'workflowState']),
    workflowAssignee: state.getIn(['workflow', 'workflowAssignee']),
    workflowTxid: state.getIn(['workflow', 'workflowTxid']),
    disabledWorkflowState: state.getIn(['workflow', 'disabledWorkflowState']),
    editMode: state.getIn(['workflow', 'editMode']),
    creationStep: state.getIn(['workflow', 'creationStep']),
    users: state.getIn(['login', 'users']),
    showWorkflowDetails: state.getIn(['workflow', 'showDetails']),
    showDetailsItemId: state.getIn(['workflow', 'showDetailsItemId']),
    showHistory: state.getIn(['notifications', 'showHistory']),
    historyItems: state.getIn(['notifications', 'historyItems']),
    subProjects: state.getIn(['detailview', 'subProjects']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    workflowSortEnabled: state.getIn(['workflow', 'workflowSortEnabled']),
    workflowType: state.getIn(['workflow', 'workflowType']),
    budgetEditEnabled: state.getIn(['workflow', 'subProjectBudgetEditEnabled']),
    subProjectAmount: state.getIn(['workflow', 'subProjectAmount']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
