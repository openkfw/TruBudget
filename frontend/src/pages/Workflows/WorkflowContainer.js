import React, { Component } from 'react';
import { connect } from 'react-redux';

import globalStyles from '../../styles';

import { fetchWorkflowItems, setCurrentStep, showWorkflowDialog, storeWorkflowComment, storeWorkflowCurrency, storeWorkflowAmount, storeWorkflowAmountType, storeWorkflowName, createWorkflowItem, editWorkflowItem, storeWorkflowTxid, showWorkflowDetails, updateWorkflowSortOnState, enableWorkflowSort, storeWorkflowType, postWorkflowSort, enableSubProjectBudgetEdit, storeSubProjectAmount, postSubProjectEdit, isWorkflowApprovalRequired, fetchAllSubprojectDetails, onWorkflowDialogCancel, storeWorkflowStatus } from './actions';

import { setSelectedView } from '../Navbar/actions';
import { showHistory, fetchHistoryItems } from '../Notifications/actions';
import { addDocument, clearDocuments, prefillDocuments, validateDocument } from '../Documents/actions';
import Workflow from './Workflow';
import SubProjectDetails from './SubProjectDetails'
import { getPermissions } from '../../permissions';
import { toJS } from '../../helper';

class WorkflowContainer extends Component {
  componentWillMount() {
    const path = this.props.location.pathname.split('/');
    const projectId = path[2]
    const subProjectId = path[3];
    this.props.setSelectedView(subProjectId, 'subProject');
    this.props.fetchAllSubprojectDetails(projectId, subProjectId, true)
  }

  componentWillUnmount() {
    this.props.hideWorkflowDetails();
    this.props.onWorkflowDialogCancel();
  }

  render() {
    return (
      <div>
        <div style={globalStyles.innerContainer}>
          <SubProjectDetails {...this.props} />
          {/* <Workflow {...this.props} /> */}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllSubprojectDetails: (pId, sId, loading) => dispatch(fetchAllSubprojectDetails(pId, sId, loading)),

    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),
    openWorkflowDialog: (editMode) => dispatch(showWorkflowDialog(editMode)),
    onWorkflowDialogCancel: () => dispatch(onWorkflowDialogCancel(false)),
    storeWorkflowComment: (comment) => dispatch(storeWorkflowComment(comment)),
    storeWorkflowCurrency: (currency) => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: (amount) => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowAmountType: (type) => dispatch(storeWorkflowAmountType(type)),
    storeWorkflowName: (name) => dispatch(storeWorkflowName(name)),
    storeWorkflowStatus: (state) => dispatch(storeWorkflowStatus(state)),
    storeWorkflowTxid: (txid) => dispatch(storeWorkflowTxid(txid)),
    createWorkflowItem: (stream, workflowToAdd, documents) => dispatch(createWorkflowItem(stream, workflowToAdd, documents)),
    editWorkflowItem: (stream, key, workflowToAdd, documents, previousState) => dispatch(editWorkflowItem(stream, key, workflowToAdd, documents, previousState)),
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
    isWorkflowApprovalRequired: (approvalRequired) => dispatch(isWorkflowApprovalRequired(approvalRequired)),
  };
}

const mapStateToProps = (state) => {
  return {
    id: state.getIn(['workflow', 'id']),
    displayName: state.getIn(['workflow', 'displayName']),
    description: state.getIn(['workflow', 'description']),
    status: state.getIn(['workflow', 'status']),
    amount: state.getIn(['workflow', 'amount']),
    currency: state.getIn(['workflow', 'currency']),
    allowedIntents: state.getIn(['workflow', 'allowedIntents']),
    workflowItems: state.getIn(['workflow', 'workflowItems']),

    subProjectDetails: state.getIn(['workflow', 'subProjectDetails']),
    workflowDialogVisible: state.getIn(['workflow', 'workflowDialogVisible']),
    workflowToAdd: state.getIn(['workflow', 'workflowToAdd']),
    workflowState: state.getIn(['workflow', 'workflowState']),
    editMode: state.getIn(['workflow', 'editMode']),
    currentStep: state.getIn(['workflow', 'currentStep']),
    showWorkflowDetails: state.getIn(['workflow', 'showDetails']),
    showDetailsItemId: state.getIn(['workflow', 'showDetailsItemId']),
    showHistory: state.getIn(['notifications', 'showHistory']),
    historyItems: state.getIn(['workflow', 'historyItems']),
    subProjects: state.getIn(['detailview', 'subProjects']),
    workflowSortEnabled: state.getIn(['workflow', 'workflowSortEnabled']),
    budgetEditEnabled: state.getIn(['workflow', 'subProjectBudgetEditEnabled']),
    subProjectAmount: state.getIn(['workflow', 'subProjectAmount']),
    workflowDocuments: state.getIn(['documents', 'tempDocuments']),
    validatedDocuments: state.getIn(['documents', 'validatedDocuments']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer));
