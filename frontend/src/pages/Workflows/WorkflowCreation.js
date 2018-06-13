import React from "react";

import Divider from "@material-ui/core/Divider";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import WorkflowCreationAmount from "./WorkflowCreationAmount";
import DocumentUpload from "../Documents/DocumentUpload";
import Identifier from "../Common/Identifier";

const handleSubmit = props => {
  const { createWorkflowItem, hideCreateDialog, workflowToAdd, workflowDocuments } = props;
  createWorkflowItem(workflowToAdd, workflowDocuments);
  hideCreateDialog();
};

const Content = props => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%" }}>
        <Identifier
          nameLabel={strings.workflow.workflow_title}
          nameHintText={strings.workflow.workflow_title_description}
          name={props.workflowToAdd.displayName}
          nameOnChange={props.storeWorkflowName}
          commentLabel={strings.workflow.workflow_comment}
          commentHintText={strings.common.comment_description}
          comment={props.workflowToAdd.description}
          commentOnChange={props.storeWorkflowComment}
        />
      </div>
      <Divider />
      <WorkflowCreationAmount
        subProjectCurrency={props.currency}
        storeWorkflowAmount={props.storeWorkflowAmount}
        storeWorkflowAmountType={props.storeWorkflowAmountType}
        storeWorkflowCurrency={props.storeWorkflowCurrency}
        workflowAmount={props.workflowToAdd.amount}
        workflowAmountType={props.workflowToAdd.amountType}
        workflowCurrency={props.workflowToAdd.currency}
      />
    </div>
  );
};
const WorkflowCreation = props => {
  const steps = [
    {
      title: strings.workflow.workflow_name,
      content: (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Content {...props} />
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
      title={props.editMode ? strings.workflow.edit_item : strings.workflow.workflow}
      dialogShown={props.creationDialogShown}
      onDialogCancel={props.hideCreateDialog}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default WorkflowCreation;
