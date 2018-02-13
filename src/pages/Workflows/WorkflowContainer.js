import React, { Component } from 'react';
import { connect } from 'react-redux';

import globalStyles from '../../styles';


import { fetchWorkflowItems, setCurrentStep, showWorkflowDialog, storeWorkflowComment, storeWorkflowCurrency, storeWorkflowAmount, storeWorkflowAmountType, storeWorkflowName, storeWorkflowState, storeWorkflowAssignee, createWorkflowItem, editWorkflowItem, disableWorkflowState, storeWorkflowTxid, showWorkflowDetails, updateWorkflowSortOnState, enableWorkflowSort, storeWorkflowType, postWorkflowSort, enableSubProjectBudgetEdit, storeSubProjectAmount, postSubProjectEdit, isWorkflowApprovalRequired, hideWorkflowDialog } from './actions';

import { setSelectedView } from '../Navbar/actions';
import { showHistory, fetchHistoryItems } from '../Notifications/actions';
import { addDocument, clearDocuments, prefillDocuments, validateDocument } from '../Documents/actions';
import Workflow from './Workflow';
import SubProjectDetails from './SubProjectDetails'
import { getPermissions } from '../../permissions';
import { fetchRoles } from '../Login/actions';



class WorkflowContainer extends Component {
  componentWillMount() {
    const subProjectId = this.props.location.pathname.split('/')[3];
    this.props.fetchWorkflowItems(subProjectId);
    this.props.fetchHistoryItems(subProjectId);
    this.props.setSelectedView(subProjectId, 'subProject');
    this.props.fetchRoles();
  }

  componentWillUnmount() {
    this.props.hideWorkflowDetails();
    this.props.hideWorkflowDialog();
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
    openWorkflowDialog: (editMode) => dispatch(showWorkflowDialog(editMode)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog(false)),
    storeWorkflowComment: (comment) => dispatch(storeWorkflowComment(comment)),
    storeWorkflowCurrency: (currency) => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: (amount) => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowAmountType: (type) => dispatch(storeWorkflowAmountType(type)),
    storeWorkflowName: (name) => dispatch(storeWorkflowName(name)),
    storeWorkflowAssignee: (assignee) => dispatch(storeWorkflowAssignee(assignee)),
    storeWorkflowState: (state) => dispatch(storeWorkflowState(state)),
    storeWorkflowTxid: (txid) => dispatch(storeWorkflowTxid(txid)),
    enableWorkflowState: () => dispatch(disableWorkflowState(false)),
    disableWorkflowState: () => dispatch(disableWorkflowState(true)),
    createWorkflowItem: (stream, workflowName, amount, amountType, currency, comment, documents, state, assignee, type, approvalRequired) => dispatch(createWorkflowItem(stream, workflowName, amount, amountType, currency, comment, documents, state, assignee, type, approvalRequired)),
    editWorkflowItem: (stream, key, workflowName, amount, amountType, currency, comment, documents, state, assignee, txid, previousState, type, approvalRequired) => dispatch(editWorkflowItem(stream, key, workflowName, amount, amountType, currency, comment, documents, state, assignee, txid, previousState, type, approvalRequired)),
    openWorkflowDetails: (txid) => dispatch(showWorkflowDetails(true, txid)),
    hideWorkflowDetails: () => dispatch(showWorkflowDetails(false)),
    openHistory: () => dispatch(showHistory(true)),
    hideHistory: () => dispatch(showHistory(false)),
    fetchHistoryItems: (subProjectName) => dispatch(fetchHistoryItems(subProjectName)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    setCurrentStep: (step) => dispatch(setCurrentStep(step)),
    updateWorkflowSortOnState: (items) => dispatch(updateWorkflowSortOnState(items)),
    enableWorkflowSort: () => dispatch(enableWorkflowSort(true)),
    postWorkflowSort: (streamName, workflowItems) => dispatch(postWorkflowSort(streamName, workflowItems)),
    storeWorkflowType: (value) => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    storeSubProjectAmount: (amount) => dispatch(storeSubProjectAmount(amount)),
    postSubProjectEdit: (parent, streamName, status, amount) => dispatch(postSubProjectEdit(parent, streamName, status, amount)),
    addDocument: (payload, name, id) => dispatch(addDocument(payload, name, id)),
    clearDocuments: () => dispatch(clearDocuments()),
    validateDocument: (payload, hash) => dispatch(validateDocument(payload, hash)),
    prefillDocuments: (documents) => dispatch(prefillDocuments(documents)),
    fetchRoles: () => dispatch(fetchRoles()),
    isWorkflowApprovalRequired: (approvalRequired) => dispatch(isWorkflowApprovalRequired(approvalRequired)),
  };
}

const mapStateToProps = (state) => {
  return {
    workflowItems: state.getIn(['workflow', 'workflowItems']).toJS(),
    subProjectDetails: state.getIn(['workflow', 'subProjectDetails']).toJS(),
    workflowDialogVisible: state.getIn(['workflow', 'workflowDialogVisible']),
    workflowName: state.getIn(['workflow', 'workflowName']),
    workflowAmount: state.getIn(['workflow', 'workflowAmount']),
    workflowAmountType: state.getIn(['workflow', 'workflowAmountType']),
    workflowComment: state.getIn(['workflow', 'workflowComment']),
    workflowCurrency: state.getIn(['workflow', 'workflowCurrency']),
    workflowState: state.getIn(['workflow', 'workflowState']),
    workflowAssignee: state.getIn(['workflow', 'workflowAssignee']),
    workflowTxid: state.getIn(['workflow', 'workflowTxid']),
    disabledWorkflowState: state.getIn(['workflow', 'disabledWorkflowState']),
    editMode: state.getIn(['workflow', 'editMode']),
    currentStep: state.getIn(['workflow', 'currentStep']),
    users: state.getIn(['login', 'users']).toJS(),
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
    workflowApprovalRequired: state.getIn(['workflow', 'workflowApprovalRequired']),
    workflowDocuments: state.getIn(['documents', 'tempDocuments']).toJS(),
    validatedDocuments: state.getIn(['documents', 'validatedDocuments']).toJS(),
    roles: state.getIn(['login', 'roles']).toJS()

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
