import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect } from "react";
import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import DatePicker from "../Common/DatePicker";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import SingleSelection from "../Common/SingleSelection";
import DocumentUpload from "../Documents/DocumentUpload";
import { compareWorkflowItems } from "./compareWorkflowItems";
import WorkflowDialogAmount from "./WorkflowDialogAmount";

const types = ["general", "restricted"];

const styles = {
  container: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
    display: "flex",
    justifyContent: "space-between"
  },
  dropdown: {
    minWidth: 200
  },
  inputContainer: {
    display: "flex",
    width: "45%",
    paddingRight: 20,
    alignItems: "flex-end"
  },
  infoIcon: {
    marginLeft: "5px",
    marginBottom: "7px",
    fontSize: "x-large"
  }
};

const handleCreate = props => {
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
    workflowitemType
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
    subprojectDisplayName
  );

  storeSnackbarMessage(strings.formatString(strings.snackbar.permissions_warning, shortenedDisplayName(displayName)));
  onDialogCancel();
};

const handleEdit = props => {
  const { editWorkflowItem, onDialogCancel, workflowItems, workflowToAdd, location, storeSnackbarMessage } = props;
  const originalWorkflowItem = workflowItems.find(workflowItem => workflowItem.data.id === workflowToAdd.id).data;

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

const getDropdownMenuItems = types => {
  return types.map((type, index) => {
    return (
      <MenuItem key={index} value={type}>
        {type}
      </MenuItem>
    );
  });
};

const Content = props => {
  const { workflowitemType } = props.workflowToAdd;
  const {
    selectedAssignee,
    users,
    creationDialogShown,
    storeWorkflowitemType,
    storeWorkflowAssignee,
    hasSubprojectValidator,
    subprojectValidator,
    hasFixedWorkflowitemType,
    fixedWorkflowitemType
  } = props;

  const typesDescription = {
    general: strings.workflow.workflowitem_type_general,
    restricted: strings.workflow.workflowitem_type_restricted
  };

  const getWorkflowitemTypeInfo = type => {
    switch (type) {
      case "general":
        return typesDescription.general;
      case "restricted":
        return typesDescription.restricted;
      default:
        return typesDescription.general;
    }
  };

  return (
    <div data-test={"workflow-dialog-content"}>
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
      <div style={styles.container}>
        <div style={styles.inputContainer}>
          <DatePicker
            id="due-date"
            label={strings.common.dueDate}
            datetime={props.workflowToAdd.dueDate}
            onChange={date => {
              props.storeWorkflowDueDate(date);
            }}
            onDelete={() => {
              props.storeWorkflowDueDate(null);
            }}
          />
        </div>
        {creationDialogShown ? (
          <>
            <div style={styles.inputContainer}>
              <Dropdown
                disabled={hasFixedWorkflowitemType}
                style={styles.dropdown}
                floatingLabel={strings.workflow.workflowitem_type}
                value={hasFixedWorkflowitemType ? fixedWorkflowitemType : workflowitemType}
                onChange={value => storeWorkflowitemType(value)}
                id="types"
              >
                {getDropdownMenuItems(types)}
              </Dropdown>
              <Tooltip title={getWorkflowitemTypeInfo(workflowitemType)} placement="right">
                <InfoOutlinedIcon style={styles.infoIcon} />
              </Tooltip>
            </div>
            <div style={styles.inputContainer}>
              <SingleSelection
                disabled={hasSubprojectValidator}
                floatingLabel={strings.subproject.workflowitem_assignee}
                selectId={hasSubprojectValidator ? subprojectValidator : selectedAssignee}
                selectableItems={users}
                onSelect={(assigneeId, assigneeDisplayName) => {
                  storeWorkflowAssignee(assigneeId);
                }}
              />
            </div>
          </>
        ) : null}
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
  const {
    workflowItems,
    workflowToAdd,
    editDialogShown,
    creationDialogShown,
    storeWorkflowDocument,
    currentUser,
    storeWorkflowAssignee,
    hasSubprojectValidator,
    subprojectValidator,
    storeWorkflowitemType,
    hasFixedWorkflowitemType,
    fixedWorkflowitemType,
    workflowitemType,
    fetchVersions,
    versions,
    setStorageServiceAvailable,
    storageServiceAvailable
  } = props;

  useEffect(() => {
    if (creationDialogShown) {
      storeWorkflowAssignee(hasSubprojectValidator ? subprojectValidator : currentUser);
      storeWorkflowitemType(hasFixedWorkflowitemType ? fixedWorkflowitemType : props.workflowToAdd.workflowitemType);
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
    props.workflowToAdd.workflowitemType
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
    : {
        handleSubmit: handleCreate,
        dialogShown: creationDialogShown
      };
  const { displayName, amountType, amount } = workflowToAdd;
  const exchangeRate = fromAmountString(workflowToAdd.exchangeRate);
  const changes = compareObjects(workflowItems, workflowToAdd);
  delete changes.assignee;
  const documentStep = {
    title: strings.workflow.workflow_documents,
    content: (
      <DocumentUpload
        storeWorkflowDocument={storeWorkflowDocument}
        workflowDocuments={workflowToAdd.documents}
        {...props}
      />
    ),
    nextDisabled:
      workflowToAdd.amountType === "N/A" && Object.keys(changes).length === 2
        ? Object.keys(changes).length === 2 && changes.hasOwnProperty("currency") && changes.hasOwnProperty("amount")
        : _isEmpty(changes)
  };

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
    }
  ];

  if (storageServiceAvailable) {
    steps.push(documentStep);
  }

  return (
    <CreationDialog
      title={props.dialogTitle}
      onDialogCancel={props.hideWorkflowDialog}
      steps={steps}
      numberOfSteps={steps.length}
      {...specificProps}
      {...props}
    />
  );
};

export default WorkflowDialog;
