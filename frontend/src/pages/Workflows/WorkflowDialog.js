import React from "react";

import Divider from "@material-ui/core/Divider";

import { compareWorkflowItems } from "./compareWorkflowItems";
import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import WorkflowDialogAmount from "./WorkflowDialogAmount";
import DocumentUpload from "../Documents/DocumentUpload";
import Identifier from "../Common/Identifier";
import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";
import _isEmpty from "lodash/isEmpty";

const styles = {
  container: {
    width: "100%"
  }
};
const handleCreate = props => {
  const { createWorkflowItem, onDialogCancel, workflowToAdd, storeSnackbarMessage } = props;
  const { displayName, amount, amountType, currency, description, status, documents, exchangeRate } = workflowToAdd;
  createWorkflowItem(
    displayName,
    fromAmountString(amount).toString(),
    exchangeRate,
    amountType,
    currency,
    description,
    status,
    documents
  );
  storeSnackbarMessage(strings.workflow.workflow_permissions_warning + " " + shortenedDisplayName(displayName));
  onDialogCancel();
};

const handleEdit = props => {
  const { editWorkflowItem, onDialogCancel, workflowItems, workflowToAdd, location, storeSnackbarMessage } = props;
  const originalWorkflowItem = workflowItems.find(workflowItem => workflowItem.data.id === workflowToAdd.id).data;
  // TODO handle change in state through actions
  if (workflowToAdd.amountType === "N/A") {
    if (workflowToAdd.amountType === originalWorkflowItem.amountType) {
      delete workflowToAdd.amount;
      delete workflowToAdd.currency;
      delete workflowToAdd.exchangeRate;
    } else {
      workflowToAdd.amount = "";
      workflowToAdd.currency = "";
      workflowToAdd.exchangeRate = 1;
    }
  }
  const changes = compareWorkflowItems(originalWorkflowItem, workflowToAdd);
  if (changes) {
    const projectId = location.pathname.split("/")[2];
    const subprojectId = location.pathname.split("/")[3];
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editWorkflowItem(projectId, subprojectId, workflowToAdd.id, changes);
  }
  storeSnackbarMessage(
    strings.common.edited + " " + strings.common.workflowitem + " " + shortenedDisplayName(workflowToAdd.displayName)
  );
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
        storeWorkflowExchangeRate={props.storeWorkflowExchangeRate}
        exchangeRate={props.workflowToAdd.exchangeRate}
        workflowAmountType={props.workflowToAdd.amountType}
        workflowCurrency={props.workflowToAdd.currency}
        defaultWorkflowExchangeRate={props.defaultWorkflowExchangeRate}
      />
    </div>
  );
};
const WorkflowDialog = props => {
  const { workflowItems, workflowToAdd, editDialogShown, creationDialogShown, storeWorkflowDocument } = props;
  const specifcProps = editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: editDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: creationDialogShown
      };
  const { displayName, amountType, amount, exchangeRate } = workflowToAdd;
  const changes = compareObjects(workflowItems, workflowToAdd);
  const steps = [
    {
      title: strings.workflow.workflow_name,
      nextDisabled:
        _isEmpty(displayName) ||
        (amountType !== "N/A" && amount === "") ||
        (amountType !== "N/A" && (!Number.isFinite(exchangeRate) || exchangeRate === 0)),
      content: (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Content {...props} />
        </div>
      )
    },

    {
      title: strings.workflow.workflow_documents,
      content: (
        <DocumentUpload storeWorkflowDocument={storeWorkflowDocument} workflowDocuments={workflowToAdd.documents} />
      ),
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
