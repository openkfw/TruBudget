import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import _isEmpty from "lodash/isEmpty";
import { default as React } from "react";
import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import DatePicker from "../Common/DatePicker";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
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
  info: {
    display: "flex"
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 35,
    padding: 8
  }
};

const handleCreate = props => {
  const { createWorkflowItem, onDialogCancel, workflowToAdd, storeSnackbarMessage } = props;
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
    exchangeRate,
    amountType,
    currency,
    description,
    status,
    documents,
    dueDate,
    workflowitemType
  );
  storeSnackbarMessage(
    strings.formatString(strings.workflow.workflow_permissions_warning, shortenedDisplayName(displayName))
  );
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
  return (
    <div style={styles.container}>
      <div style={styles.container}>
        {props.creationDialogShown ? (
          <span style={styles.info}>
            <Dropdown
              style={styles.dropdown}
              floatingLabel={strings.workflow.workflowitem_type}
              value={workflowitemType}
              onChange={value => props.storeWorkflowitemType(value)}
              disabled={!props.creationDialogShown}
              id="types"
            >
              {getDropdownMenuItems(types)}
            </Dropdown>
            <Tooltip title={getWorkflowitemTypeInfo(workflowitemType)} placement="right">
              <InfoOutlinedIcon style={styles.infoIcon} />
            </Tooltip>
          </span>
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
