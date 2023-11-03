import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";
import DatePicker from "../Common/DatePicker";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import SingleSelection from "../Common/SingleSelection";

import * as templates from "./templates/workflowTemplates";
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

const renderDropdownMenuItems = (types) => {
  return types.map((type, index) => {
    return (
      <MenuItem key={index} value={type}>
        {type}
      </MenuItem>
    );
  });
};

const renderDropdownTemplates = (templates) => {
  return Object.keys(templates).map((template, index) => {
    return (
      <MenuItem key={index} value={template}>
        {strings.workflowTemplate[template]}
      </MenuItem>
    );
  });
};

const WorkflowDialogContent = (props) => {
  const {
    creationDialogShown,
    fixedWorkflowitemType,
    hasFixedWorkflowitemType,
    hasSubprojectValidator,
    selectedAssignee,
    storeWorkflowAssignee,
    storeWorkflowitemType,
    storeWorkflowTemplate,
    subprojectValidator,
    users,
    workflowTemplate,
    workflowToAdd,
    storeWorkflowName,
    storeWorkflowComment,
    storeWorkflowDueDate,
    currency,
    storeWorkflowAmount,
    storeWorkflowAmountType,
    storeWorkflowCurrency,
    storeWorkflowExchangeRate,
    defaultWorkflowExchangeRate
  } = props;
  const { workflowitemType } = workflowToAdd;
  const isWorkflowFromTemplate = !!workflowTemplate;

  const typesDescription = {
    general: strings.workflow.workflowitem_type_general,
    restricted: strings.workflow.workflowitem_type_restricted
  };

  const getWorkflowitemTypeInfo = (type) => {
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
      <div style={styles.inputContainer}>
        <Dropdown
          style={styles.dropdown}
          floatingLabel={"Workflow template"}
          value={workflowTemplate}
          onChange={(value) => storeWorkflowTemplate(value)}
          id="workflow-templates"
        >
          {renderDropdownTemplates(templates)}
        </Dropdown>
        {workflowTemplate ? (
          <IconButton
            aria-label="cancel"
            data-test={"clear-workflowitem-template"}
            style={styles.clearButton}
            onClick={() => storeWorkflowTemplate("")}
            size="large"
          >
            <CancelIcon color="action" style={{ fontSize: "x-large" }} />
          </IconButton>
        ) : null}
      </div>
      <Divider />
      <div>
        <Identifier
          nameLabel={strings.workflow.workflow_title}
          nameHintText={strings.workflow.workflow_title_description}
          name={workflowToAdd.displayName}
          nameOnChange={storeWorkflowName}
          commentLabel={strings.workflow.workflow_comment}
          commentHintText={strings.common.comment_description}
          comment={workflowToAdd.description}
          commentOnChange={storeWorkflowComment}
          disabled={isWorkflowFromTemplate}
        />
        <div style={styles.container}>
          <div style={styles.inputContainer}>
            <DatePicker
              id="due-date"
              label={strings.common.dueDate}
              datetime={workflowToAdd.dueDate}
              onChange={(date) => {
                storeWorkflowDueDate(date);
              }}
              onDelete={() => {
                storeWorkflowDueDate(null);
              }}
              disabled={isWorkflowFromTemplate}
            />
          </div>
          {creationDialogShown ? (
            <>
              <div style={styles.inputContainer}>
                <Dropdown
                  disabled={hasFixedWorkflowitemType || isWorkflowFromTemplate}
                  style={styles.dropdown}
                  floatingLabel={strings.workflow.workflowitem_type}
                  value={hasFixedWorkflowitemType ? fixedWorkflowitemType : workflowitemType}
                  onChange={(value) => storeWorkflowitemType(value)}
                  id="types"
                >
                  {renderDropdownMenuItems(types)}
                </Dropdown>
                <Tooltip title={getWorkflowitemTypeInfo(workflowitemType)} placement="right">
                  <InfoOutlinedIcon style={styles.infoIcon} />
                </Tooltip>
              </div>
              <div style={styles.inputContainer}>
                <SingleSelection
                  disabled={hasSubprojectValidator || isWorkflowFromTemplate}
                  floatingLabel={strings.subproject.workflowitem_assignee}
                  selectId={hasSubprojectValidator ? subprojectValidator : selectedAssignee}
                  selectableItems={users}
                  onSelect={(assigneeId) => {
                    storeWorkflowAssignee(assigneeId);
                  }}
                />
              </div>
            </>
          ) : null}
        </div>
        <Divider />
        <WorkflowDialogAmount
          subProjectCurrency={currency}
          storeWorkflowAmount={storeWorkflowAmount}
          storeWorkflowAmountType={storeWorkflowAmountType}
          storeWorkflowCurrency={storeWorkflowCurrency}
          workflowAmount={workflowToAdd.amount}
          storeWorkflowExchangeRate={storeWorkflowExchangeRate}
          exchangeRate={workflowToAdd.exchangeRate}
          workflowAmountType={workflowToAdd.amountType}
          workflowCurrency={workflowToAdd.currency}
          defaultWorkflowExchangeRate={defaultWorkflowExchangeRate}
          disabled={isWorkflowFromTemplate}
        />
      </div>
    </div>
  );
};

export default WorkflowDialogContent;
