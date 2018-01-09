import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import WorkflowCreationStepper from './WorkflowCreationStepper';
import strings from '../../localizeStrings'


const getWorkflowActions = (props, handleCancel, handleBack, handleNext, handleSubmit) => {
  const isLastStep = props.creationStep === 5;
  const isFirstStep = props.creationStep === 0;
  const editMode = props.editMode;

  const cancelButton = <FlatButton label={ strings.common.cancel } secondary={ true } onTouchTap={ () => handleCancel(props) } />
  const backButton = <FlatButton label={ strings.common.back } primary={ true } disabled={ isFirstStep } onTouchTap={ () => handleBack(props) } />
  const nextButton = <FlatButton label={ strings.common.next } primary={ true } disabled={ isLastStep } onTouchTap={ () => handleNext(props) } />
  const submitButton = <FlatButton label={ strings.common.submit } primary={ true } disabled={ !isLastStep && !editMode } onTouchTap={ () => handleSubmit(props) } />

  const leftActions = <div>
                        { cancelButton }
                        { backButton }
                      </div>
  const rightActions = <div>
                         { nextButton }
                         { submitButton }
                       </div>

  return [
    leftActions,
    rightActions
  ]
}

const handleCancel = (props) => {
  props.hideWorkflowDialog();
  props.clearDocuments();
}

const handleBack = (props) => props.setWorkflowCreationStep(props.creationStep - 1)
const handleNext = (props) => props.setWorkflowCreationStep(props.creationStep + 1)

const handleSubmit = (props) => {
  if (props.editMode) {
    const currentWorkflowItem = props.workflowItems.find((item) => item.txid === props.workflowTxid);
    props.editWorkflowItem(props.location.pathname.split('/')[3], currentWorkflowItem.key, props.workflowName, props.workflowAmount, props.workflowAmountType, props.workflowCurrency, props.workflowComment, props.workflowDocuments, props.workflowState, props.workflowAssignee, props.workflowTxid, currentWorkflowItem.data, props.workflowType, props.workflowApprovalRequired)
  } else {
    props.createWorkflowItem(props.location.pathname.split('/')[3], props.workflowName, props.workflowAmount, props.workflowAmountType, props.workflowCurrency, props.workflowComment, props.workflowDocuments, props.workflowState, props.workflowAssignee, props.workflowType, props.workflowApprovalRequired)
  }

  props.hideWorkflowDialog();
  props.setWorkflowCreationStep(0);
}

const WorkflowCreationDialog = (props) => (
  <Dialog title={ props.editMode ? strings.workflow.edit_item : strings.workflow.workflow } modal={ true } bodyStyle={ { minHeight: '200px' } } actionsContainerStyle={ { display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'space-between' } } open={ props.showWorkflow }
    onRequestClose={ props.hideWorkflowDialog } editMode={ props.editMode } actions={ getWorkflowActions(props, handleCancel, handleBack, handleNext, handleSubmit) }>
    <WorkflowCreationStepper {...props} />
  </Dialog>
);

export default WorkflowCreationDialog;
