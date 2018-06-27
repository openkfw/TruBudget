import React from "react";

import Divider from "@material-ui/core/Divider";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import WorkflowDialogAmount from "./WorkflowDialogAmount";
import DocumentUpload from "../Documents/DocumentUpload";
import Identifier from "../Common/Identifier";
import { compareObjects, fromAmountString } from "../../helper";
import _isEmpty from "lodash/isEmpty";

const styles = {
  container: {
    width: "100%"
  }
};
const handleCreate = props => {
  const { createWorkflowItem, onDialogCancel, workflowToAdd, workflowDocuments } = props;
  const { displayName, amount, amountType, currency, description, status } = workflowToAdd;
  createWorkflowItem(
    displayName,
    fromAmountString(amount).toString(),
    amountType,
    currency,
    description,
    status,
    workflowDocuments
  );
  onDialogCancel();
};

const handleEdit = props => {
  const { editWorkflowItem, onDialogCancel, workflowItems, workflowToAdd, location } = props;
  const { id } = workflowToAdd;
  const originalItem = workflowItems.find(workflowitem => workflowitem.data.id === id);
  const changes = compareObjects(workflowToAdd, originalItem.data);
  if (changes) {
    const projectId = location.pathname.split("/")[2];
    const subprojectId = location.pathname.split("/")[3];
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editWorkflowItem(projectId, subprojectId, id, changes);
  }
  onDialogCancel();
};

const Content = props => {
  return (
    <div style={styles.container}>
      <div style={styles.container}>
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
      <WorkflowDialogAmount
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
const WorkflowDialog = props => {
  const specifcProps = props.editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: props.editDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: props.creationDialogShown
      };

  const { displayName } = props.workflowToAdd;
  const steps = [
    {
      title: strings.workflow.workflow_name,
      nextDisabled: _isEmpty(displayName),
      content: (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Content {...props} />
        </div>
      )
    },

    {
      title: strings.workflow.workflow_documents,
      content: <DocumentUpload addDocument={props.addDocument} workflowDocuments={props.workflowDocuments} />,
      nextDisabled: true
    }
  ];
  return (
    <CreationDialog
      title={props.dialogTitle}
      onDialogCancel={props.hideWorkflowDialog}
      steps={steps}
      numberOfSteps={steps.length}
      {...specifcProps}
      {...props}
    />
  );
};

export default WorkflowDialog;
