import React, { useEffect } from "react";
import _isEmpty from "lodash/isEmpty";

import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import DocumentUpload from "../Documents/DocumentUpload";

import * as templates from "./templates/workflowTemplates";
import { compareWorkflowItems } from "./compareWorkflowItems";
import WorkflowDialogContent from "./WorkflowDialogContent";

const handleCreate = (props) => {
  const {
    createWorkflowItem,
    onDialogCancel,
    workflowToAdd,
    storeSnackbarMessage,
    projectDisplayName,
    subprojectDisplayName
  } = props;

  const {
    displayName,
    amount,
    amountType,
    currency,
    description,
    status,
    documents,
    exchangeRate,
    dueDate,
    workflowitemType,
    tags,
    fundingOrganization
  } = workflowToAdd;

  createWorkflowItem(
    displayName,
    fromAmountString(amount).toString(),
    fromAmountString(exchangeRate).toString(),
    amountType,
    currency,
    description,
    status,
    documents,
    dueDate,
    workflowitemType,
    projectDisplayName,
    subprojectDisplayName,
    tags,
    fundingOrganization
  );

  storeSnackbarMessage(strings.formatString(strings.snackbar.permissions_warning, shortenedDisplayName(displayName)));
  onDialogCancel();
};

const handleCreateFromTemplate = (props) => {
  const {
    createWorkflowFromTemplate,
    onDialogCancel,
    workflowToAdd,
    storeSnackbarMessage,
    projectDisplayName,
    subprojectDisplayName,
    workflowTemplate
  } = props;

  const {
    amount,
    amountType,
    currency,
    description,
    displayName,
    documents,
    dueDate,
    exchangeRate,
    status,
    workflowitemType,
    fundingOrganization
  } = workflowToAdd;

  const workflowitems = createWorkflowItemsFromTemplate(workflowTemplate, workflowToAdd);

  createWorkflowFromTemplate({
    amount: fromAmountString(amount).toString(),
    amountType,
    currency,
    description,
    displayName,
    documents,
    dueDate,
    exchangeRate: fromAmountString(exchangeRate).toString(),
    projectDisplayName,
    status,
    subprojectDisplayName,
    workflowitemType,
    workflowTemplate,
    workflowitems,
    fundingOrganization
  });

  storeSnackbarMessage(strings.formatString(strings.snackbar.permissions_warning, shortenedDisplayName(displayName)));
  onDialogCancel();
};

const handleEdit = (props) => {
  const { editWorkflowItem, onDialogCancel, workflowItems, workflowToAdd, location, storeSnackbarMessage } = props;
  const originalWorkflowItem = workflowItems.find((workflowItem) => workflowItem.data.id === workflowToAdd.id).data;

  if (workflowToAdd.amountType === "N/A") {
    if (workflowToAdd.amountType === originalWorkflowItem.amountType) {
      delete workflowToAdd.amount;
      delete workflowToAdd.currency;
      delete workflowToAdd.exchangeRate;
      delete workflowToAdd.fundingOrganization;
    } else {
      workflowToAdd.amount = "";
      workflowToAdd.currency = "";
      workflowToAdd.exchangeRate = 1;
      workflowToAdd.fundingOrganization = "";
    }
  }
  const changes = compareWorkflowItems(originalWorkflowItem, workflowToAdd);
  if (changes) {
    const projectId = location.pathname.split("/")[2];
    const subprojectId = location.pathname.split("/")[3];
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    if (changes.exchangeRate) {
      changes.exchangeRate = fromAmountString(changes.exchangeRate).toString();
    }

    delete changes.assignee;
    editWorkflowItem(projectId, subprojectId, workflowToAdd.id, changes);
  }
  storeSnackbarMessage(
    strings.formatString(
      strings.snackbar.update_succeed_message,
      shortenedDisplayName(originalWorkflowItem.displayName)
    )
  );
  onDialogCancel();
};

const createWorkflowItemsFromTemplate = (selectedTemplate, workflowToAdd) => {
  const {
    amount,
    amountType,
    currency,
    description,
    documents,
    dueDate,
    exchangeRate,
    status,
    workflowitemType,
    fundingOrganization
  } = workflowToAdd;
  const template = templates[selectedTemplate];
  return template.steps.map((step) => {
    return {
      displayName: step.name,
      amount,
      amountType,
      currency,
      description,
      documents,
      dueDate,
      exchangeRate,
      status,
      workflowitemType,
      fundingOrganization
    };
  });
};

const WorkflowDialog = (props) => {
  const {
    workflowItems,
    workflowToAdd,
    editDialogShown,
    creationDialogShown,
    storeWorkflowDocument,
    storeWorkflowDocumentExternalLink,
    currentUser,
    storeWorkflowAssignee,
    hasSubprojectValidator,
    subprojectValidator,
    storeWorkflowitemType,
    storeWorkflowTemplate,
    hasFixedWorkflowitemType,
    fixedWorkflowitemType,
    workflowitemType,
    fetchVersions,
    versions,
    setStorageServiceAvailable,
    workflowTemplate,
    dialogTitle,
    hideWorkflowDialog,
    deleteDocument,
    deleteWorkflowDocument,
    deleteWorkflowDocumentExternalLink
  } = props;

  useEffect(() => {
    if (creationDialogShown) {
      storeWorkflowAssignee(hasSubprojectValidator ? subprojectValidator : currentUser);
      storeWorkflowitemType(hasFixedWorkflowitemType ? fixedWorkflowitemType : workflowToAdd.workflowitemType);
      storeWorkflowTemplate(workflowTemplate);
    } else {
      storeWorkflowTemplate("");
    }
  }, [
    storeWorkflowAssignee,
    currentUser,
    creationDialogShown,
    hasSubprojectValidator,
    subprojectValidator,
    storeWorkflowitemType,
    hasFixedWorkflowitemType,
    fixedWorkflowitemType,
    workflowitemType,
    workflowToAdd.workflowitemType,
    workflowTemplate,
    storeWorkflowTemplate
  ]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  useEffect(() => {
    if (versions["storage"] && versions["storage"].ping) {
      setStorageServiceAvailable(true);
    }
    return () => {
      setStorageServiceAvailable(false);
    };
  }, [setStorageServiceAvailable, versions]);

  const specificProps = editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: editDialogShown
      }
    : workflowTemplate
    ? {
        handleSubmit: handleCreateFromTemplate,
        dialogShown: creationDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: creationDialogShown
      };
  const { displayName, amountType, amount, fundingOrganization, id } = workflowToAdd;
  const { location } = props;
  const exchangeRate = fromAmountString(workflowToAdd.exchangeRate);
  const changes = compareObjects(workflowItems, workflowToAdd);
  delete changes.assignee;
  const projectId = location.pathname.split("/")[2];
  const subprojectId = location.pathname.split("/")[3];
  const documentStep = {
    title: strings.workflow.workflow_documents,
    content: (
      <DocumentUpload
        storeWorkflowDocument={storeWorkflowDocument}
        storeWorkflowDocumentExternalLink={storeWorkflowDocumentExternalLink}
        workflowDocuments={workflowToAdd.documents}
        deleteDocument={deleteDocument}
        deleteWorkflowDocument={deleteWorkflowDocument}
        deleteWorkflowDocumentExternalLink={deleteWorkflowDocumentExternalLink}
        projectId={projectId}
        subprojectId={subprojectId}
        workflowitemId={id}
        {...props}
      />
    ),
    nextDisabled:
      workflowToAdd.amountType === "N/A" && Object.keys(changes).length === 3
        ? Object.keys(changes).length === 3 &&
          Object.hasOwn(changes, "currency") &&
          Object.hasOwn(changes, "amount") &&
          Object.hasOwn(changes, "fundingOrganization")
        : _isEmpty(changes)
  };

  const steps = [
    {
      title: strings.workflow.workflow_name,
      nextDisabled:
        (workflowTemplate === "" && _isEmpty(displayName)) ||
        (amountType !== "N/A" && (amount === "" || fundingOrganization === "")) ||
        (amountType !== "N/A" && (!Number.isFinite(exchangeRate) || exchangeRate === 0)),
      content: (
        <div className="workflow-dialog-content">
          <WorkflowDialogContent {...props} />
        </div>
      )
    }
  ];

  if (editDialogShown || creationDialogShown) {
    steps.push(documentStep);
  }

  return (
    <CreationDialog
      title={dialogTitle}
      onDialogCancel={hideWorkflowDialog}
      steps={steps}
      numberOfSteps={steps.length}
      {...specificProps}
      {...props}
    />
  );
};

export default WorkflowDialog;
