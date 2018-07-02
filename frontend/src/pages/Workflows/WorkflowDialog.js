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
  const {
    createWorkflowItem,
    onDialogCancel,
    workflowToAdd,
    workflowDocuments,
    storeSnackbarMessage,
    showSnackbar
  } = props;
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
  storeSnackbarMessage(strings.common.created + " " + strings.common.workflowItem + " " + displayName);
  showSnackbar();
  onDialogCancel();
};

const handleEdit = props => {
  const {
    editWorkflowItem,
    onDialogCancel,
    workflowItems,
    workflowToAdd,
    location,
    showSnackbar,
    storeSnackbarMessage
  } = props;
  const changes = compareObjects(workflowItems, workflowToAdd);
  if (changes) {
    const projectId = location.pathname.split("/")[2];
    const subprojectId = location.pathname.split("/")[3];
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editWorkflowItem(projectId, subprojectId, workflowToAdd.id, changes);
  }
  storeSnackbarMessage(strings.common.edited + " " + strings.common.workflowItem + " " + workflowToAdd.displayName);
  showSnackbar();
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
  const { workflowItems, workflowToAdd, editDialogShown, creationDialogShown, addDocument, workflowDocuments } = props;
  const specifcProps = editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: editDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: creationDialogShown
      };
  const { displayName } = workflowToAdd;
  const changes = compareObjects(workflowItems, workflowToAdd);
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
      content: <DocumentUpload addDocument={addDocument} workflowDocuments={workflowDocuments} />,
      nextDisabled:
        workflowToAdd.amountType === "N/A" && Object.keys(changes).length === 2
          ? Object.keys(changes).length === 2 && changes.hasOwnProperty("currency") && changes.hasOwnProperty("amount")
          : _isEmpty(changes)
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
