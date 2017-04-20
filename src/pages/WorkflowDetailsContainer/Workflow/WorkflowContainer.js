import React, {Component} from 'react';
import {connect} from 'react-redux';

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
  disableWorkflowState
} from './actions';
import Workflow from './Workflow';

class WorkflowContainer extends Component {
  componentWillMount() {
    this.props.fetchWorkflowItems(this.props.location.pathname.split('/')[3]);
  }

  render() {
    return <Workflow {...this.props}/>
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchWorkflowItems: (streamName) => dispatch(fetchWorkflowItems(streamName)),
    openWorkflowDialog: () => dispatch(showWorkflowDialog(true)),
    hideWorkflowDialog: () => dispatch(showWorkflowDialog(false)),
    storeWorkflowAdditionalData: (addData) => dispatch(storeWorkflowAdditionalData(addData)),
    storeWorkflowPurpose: (purpose) => dispatch(storeWorkflowPurpose(purpose)),
    storeWorkflowCurrency: (currency) => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: (amount) => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowName: (name) => dispatch(storeWorkflowName(name)),
    storeWorkflowAssignee: (assignee) => dispatch(storeWorkflowAssignee(assignee)),
    storeWorkflowState: (state) => dispatch(storeWorkflowState(state)),
    enableWorkflowState:() => dispatch(disableWorkflowState(false)),
    disableWorkflowState:() => dispatch(disableWorkflowState(true)),
    createWorkflowItem:(stream, workflowName, amount, currency, purpose, addData,state, assignee) => dispatch(createWorkflowItem(stream, workflowName, amount, currency, purpose, addData,state, assignee))

  };
}

const mapStateToProps = (state) => {
  return {
    workflowItems: state.getIn(['workflow', 'workflowItems']),
    showWorkflow: state.getIn(['workflow', 'showWorkflow']),
    workflowName: state.getIn(['workflow', 'workflowName']),
    workflowAmount: state.getIn(['workflow', 'workflowAmount']),
    workflowPurpose: state.getIn(['workflow', 'workflowPurpose']),
    workflowAdditionalData: state.getIn(['workflow', 'workflowAdditionalData']),
    workflowCurrency: state.getIn(['workflow', 'workflowCurrency']),
    workflowState: state.getIn(['workflow', 'workflowState']),
    workflowAssignee: state.getIn(['workflow', 'workflowAssignee']),
    disabledWorkflowState: state.getIn(['workflow', 'disabledWorkflowState']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowContainer);
