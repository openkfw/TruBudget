import React from 'react';
import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import WorkflowType from './WorkflowType';
import TextInput from '../Common/TextInput';
import WorkflowCreationAmount from './WorkflowCreationAmount';
import DocumentUpload from '../Documents/DocumentUpload';
import WorkflowStatus from './WorkflowStatus';

const handleSubmit = (props) => {
  const { createWorkflowItem, editWorkflowItem, onWorkflowDialogCancel, editMode, workflowToAdd } = props;
  if (editMode) {
    const currentWorkflowItem = props.workflowItems.find((item) => item.txid === props.workflowToAdd.txId);
    editWorkflowItem(props.location.pathname.split('/')[3], currentWorkflowItem.key, workflowToAdd, props.workflowDocuments, currentWorkflowItem.data)
  } else {
    createWorkflowItem(props.location.pathname.split('/')[3], workflowToAdd, props.workflowDocuments)
  }
  onWorkflowDialogCancel();
}


const WorkflowCreation = (props) => {
  const steps = [
    {
      title: strings.workflow.workflow_type,
      content: <WorkflowType
        workflowApprovalRequired={props.workflowToAdd.approvalRequired}
        isWorkflowApprovalRequired={props.isWorkflowApprovalRequired}
        workflowType={props.workflowToAdd.type} editMode={props.editMode}
        storeWorkflowType={props.storeWorkflowType}
      />
    },
    {
      title: strings.workflow.workflow_name,
      content: (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <TextInput onChange={props.storeWorkflowName}
            value={props.workflowToAdd.name}
            floatingLabelText={strings.workflow.workflow_title}
            hintText={strings.workflow.workflow_title_description}
          />
        </div>
      )
    },
    {
      title: strings.common.budget,
      content: <WorkflowCreationAmount
        subProjectCurrency={props.subProjectDetails.currency}
        storeWorkflowAmount={props.storeWorkflowAmount}
        storeWorkflowAmountType={props.storeWorkflowAmountType}
        storeWorkflowCurrency={props.storeWorkflowCurrency}
        workflowAmount={props.workflowToAdd.amount}
        workflowAmountType={props.workflowToAdd.amountType}
        workflowCurrency={props.workflowToAdd.currency}
      />
    },
    {
      title: strings.common.comment,
      content: (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <TextInput onChange={props.storeWorkflowComment}
            value={props.workflowToAdd.comment}
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
      content: <WorkflowStatus
        workflowApprovalRequired={props.workflowToAdd.approvalRequired}
        permissions={props.permissions} users={props.users}
        storeWorkflowStatus={props.storeWorkflowStatus}
        workflowStatus={props.workflowToAdd.status} editMode={props.editMode}
      />
    },
  ]


  return (
    <CreationDialog
      editable={props.editMode}
      title={props.editMode ? strings.workflow.edit_item : strings.workflow.workflow}
      creationDialogShown={props.workflowDialogVisible}
      onDialogCancel={props.onWorkflowDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props} />
  )
}

export default WorkflowCreation;
