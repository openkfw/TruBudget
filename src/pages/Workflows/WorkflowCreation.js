import React from 'react';
import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import WorkflowType from './WorkflowType';
import TextInput from '../Common/TextInput';
import WorkflowCreationAmount from './WorkflowCreationAmount';
import DocumentUpload from '../Documents/DocumentUpload';
import WorkflowStateAndAssignee from './WorkflowStateAndAssignee';

const handleSubmit = (props) => {
  if (props.editMode) {
    const currentWorkflowItem = props.workflowItems.find((item) => item.txid === props.workflowTxid);
    props.editWorkflowItem(props.location.pathname.split('/')[3], currentWorkflowItem.key, props.workflowName, props.workflowAmount, props.workflowAmountType, props.workflowCurrency, props.workflowComment, props.workflowDocuments, props.workflowState, props.workflowAssignee, props.workflowTxid, currentWorkflowItem.data, props.workflowType, props.workflowApprovalRequired)
  } else {
    props.createWorkflowItem(props.location.pathname.split('/')[3], props.workflowName, props.workflowAmount, props.workflowAmountType, props.workflowCurrency, props.workflowComment, props.workflowDocuments, props.workflowState, props.workflowAssignee, props.workflowType, props.workflowApprovalRequired)
  }
  props.hideWorkflowDialog();
  props.setCurrentStep(0);
}


const WorkflowCreation = (props) => {

  const steps = [
    {
      title: strings.workflow.workflow_type,
      content: <WorkflowType workflowApprovalRequired={props.workflowApprovalRequired} isWorkflowApprovalRequired={props.isWorkflowApprovalRequired} workflowType={props.workflowType} editMode={props.editMode}
        storeWorkflowType={props.storeWorkflowType} />
    },
    {
      title: strings.workflow.workflow_name,
      content: (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <TextInput onChange={props.storeWorkflowName}
            value={props.workflowName}
            floatingLabelText={strings.workflow.workflow_title}
            hintText={strings.workflow.workflow_title_description}
          />
        </div>
      )
    },
    {
      title: strings.common.budget,
      content: <WorkflowCreationAmount subProjectCurrency={props.subProjectDetails.currency} storeWorkflowAmount={props.storeWorkflowAmount} storeWorkflowAmountType={props.storeWorkflowAmountType} storeWorkflowCurrency={props.storeWorkflowCurrency}
        workflowAmount={props.workflowAmount} workflowAmountType={props.workflowAmountType} workflowCurrency={props.workflowCurrency} />
    },
    {
      title: strings.common.comment,
      content: (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <TextInput onChange={props.storeWorkflowComment}
            value={props.workflowComment}
            multiLine={true}
            floatingLabelText={strings.workflow.workflow_comment}
            hintText={strings.common.comment_description}
          />
        </div>
      )
    },
    {
      title: strings.workflow.workflow_documents,
      content: <DocumentUpload addDocument={props.addDocument} workflowDocuments={props.workflowDocuments} />
    },

    {
      title: strings.common.status,
      content: <WorkflowStateAndAssignee workflowApprovalRequired={props.workflowApprovalRequired} permissions={props.permissions} users={props.users} storeWorkflowState={props.storeWorkflowState}
        storeWorkflowAssignee={props.storeWorkflowAssignee} workflowAssignee={props.workflowAssignee} workflowState={props.workflowState} editMode={props.editMode} />
    },
  ]


  return (
    <CreationDialog
      editable={props.editMode}
      title={props.editMode ? strings.workflow.edit_item : strings.workflow.workflow}
      creationDialogShown={props.workflowDialogVisible}
      hideDialog={props.hideWorkflowDialog}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props} />
  )
}

export default WorkflowCreation;
