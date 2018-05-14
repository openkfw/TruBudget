import React from "react";
import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import TextInput from "../Common/TextInput";
import WorkflowCreationAmount from "./WorkflowCreationAmount";
import DocumentUpload from "../Documents/DocumentUpload";

const handleSubmit = props => {
  const {
    createWorkflowItem,
    editWorkflowItem,
    onWorkflowDialogCancel,
    editMode,
    workflowToAdd,
    workflowDocuments
  } = props;
  const subproject = props.match.params.subproject;
  if (editMode) {
    const currentWorkflowItem = props.workflowItems.find(item => item.id === props.workflowToAdd.txId);
    const { key, data } = currentWorkflowItem;
    editWorkflowItem(subproject, key, workflowToAdd, workflowDocuments, data);
  } else {
    createWorkflowItem(workflowToAdd, workflowDocuments);
  }
  onWorkflowDialogCancel();
};

const WorkflowCreation = props => {
  const steps = [
    {
      title: strings.workflow.workflow_name,
      content: (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <TextInput
            onChange={props.storeWorkflowName}
            value={props.workflowToAdd.name}
            label={strings.workflow.workflow_title}
            helperText={strings.workflow.workflow_title_description}
          />
        </div>
      )
    },
    {
      title: strings.common.budget,
      content: (
        <WorkflowCreationAmount
          subProjectCurrency={props.currency}
          storeWorkflowAmount={props.storeWorkflowAmount}
          storeWorkflowAmountType={props.storeWorkflowAmountType}
          storeWorkflowCurrency={props.storeWorkflowCurrency}
          workflowAmount={props.workflowToAdd.amount}
          workflowAmountType={props.workflowToAdd.amountType}
          workflowCurrency={props.workflowToAdd.currency}
        />
      )
    },
    {
      title: strings.common.comment,
      content: (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <TextInput
            onChange={props.storeWorkflowComment}
            value={props.workflowToAdd.comment}
            multiline={true}
            floatingLabelText={strings.workflow.workflow_comment}
            hintText={strings.common.comment_description}
          />
        </div>
      )
    },
    {
      title: strings.workflow.workflow_documents,
      content: <DocumentUpload addDocument={props.addDocument} workflowDocuments={props.workflowDocuments} />
    }
  ];

  return (
    <CreationDialog
      editable={props.editMode}
      title={props.editMode ? strings.workflow.edit_item : strings.workflow.workflow}
      creationDialogShown={props.workflowDialogVisible}
      onDialogCancel={props.onWorkflowDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default WorkflowCreation;
