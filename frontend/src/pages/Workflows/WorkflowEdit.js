import React from "react";

import Divider from "@material-ui/core/Divider";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import WorkflowCreationAmount from "./WorkflowCreationAmount";
import DocumentUpload from "../Documents/DocumentUpload";
import Identifier from "../Common/Identifier";
import { compareObjects } from "../../helper";

const handleSubmit = props => {
  const {
    createWorkflowItem,
    editWorkflowItem,
    hideEditDialog,
    workflowItems,
    workflowToAdd,
    workflowDocuments,
    location
  } = props;
  const subproject = props.match.params.subproject;
  const { id } = workflowToAdd;
  const originalItem = workflowItems.find(workflowitem => workflowitem.data.id === id);
  const changes = compareObjects(workflowToAdd, originalItem.data);
  if (changes) {
    const projectId = location.pathname.split("/")[2];
    const subprojectId = location.pathname.split("/")[3];
    editWorkflowItem(projectId, subprojectId, id, changes);
  }

  hideEditDialog();
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

const WorkflowEdit = props => {
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
      editable={props.editMode}
      title={strings.workflow.edit_item}
      dialogShown={props.editDialogShown}
      onDialogCancel={props.hideEditDialog}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default WorkflowEdit;
