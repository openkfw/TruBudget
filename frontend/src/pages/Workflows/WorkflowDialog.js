import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect } from "react";
import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import DatePicker from "../Common/DatePicker";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import AssigneeSelection from "../Common/AssigneeSelection";
import DocumentUpload from "../Documents/DocumentUpload";
import { compareWorkflowItems } from "./compareWorkflowItems";
import WorkflowDialogAmount from "./WorkflowDialogAmount";
import { types, typesDescription } from "./workflowitemTypes";

const styles = {
  container: {
    width: "100%"
  },
  dropdown: {
    minWidth: 140,
    height: 50,
    marginTop: 20
  },
  inputContainer: {
    width: "100%",
    display: "flex"
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 35,
    padding: 8
  },
  subContainer: {
    display: "flex",
    justifyContent: "space-around"
  },
  assigneeContainer: {
    margin: "25,30,0,0",
    marginTop: 35,
    marginLeft: 25,
    justifyContent: "flex-start"
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

const Content = props => {
  const { workflowitemType } = props.workflowToAdd;
  const {
    classes,
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
  return (
    <div className={classes.container} data-test={"workflow-dialog-content"}>
      <div className={classes.container}>
        {creationDialogShown ? (
          <div className={classes.subContainer}>
            <div className={classes.inputContainer}>
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
                <InfoOutlinedIcon className={classes.infoIcon} />
              </Tooltip>
            </div>
            <div className={classes.inputContainer}>
              <div className={classes.assigneeContainer}>
                <AssigneeSelection
                  disabled={hasSubprojectValidator}
                  assigneeId={hasSubprojectValidator ? subprojectValidator : selectedAssignee}
                  users={users}
                  title={"title"}
                  assign={(assigneeId, assigneeDisplayName) => {
                    storeWorkflowAssignee(assigneeId);
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}

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
        <DatePicker
          id="due-date"
          label={strings.common.dueDate}
          datetime={props.workflowToAdd.dueDate}
          onChange={e => {
            // Since native datepicker has undefined as default value, it has to be set as empty string to reset due-date in API
            e.target.value === undefined ? props.storeWorkflowDueDate("") : props.storeWorkflowDueDate(e.target.value);
          }}
          onDelete={() => {
            props.storeWorkflowDueDate("");
          }}
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
    workflowitemType
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

  const specifcProps = editDialogShown
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
  const steps = [
    {
      title: strings.workflow.workflow_name,
      nextDisabled:
        _isEmpty(displayName) ||
        (amountType !== "N/A" && amount === "") ||
        (amountType !== "N/A" && (!Number.isFinite(exchangeRate) || exchangeRate === 0)),
      content: (
        <div className={{ display: "flex", justifyContent: "space-between" }}>
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
  const { classes, ...propsWithoutClasses } = props;
  return (
    <CreationDialog
      title={props.dialogTitle}
      onDialogCancel={props.hideWorkflowDialog}
      steps={steps}
      numberOfSteps={steps.length}
      {...specifcProps}
      {...propsWithoutClasses}
    />
  );
};

export default withStyles(styles)(WorkflowDialog);
