import React, { useEffect } from "react";

import { Alert } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";

import { getCurrencies, trimSpecialChars } from "../../helper";
import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import { CustomInfoTooltip } from "../Common/CustomInfoTooltip";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import SingleSelection from "../Common/SingleSelection";

import "./SubProjectDialogContent.scss";

const subprojectWorkflowModes = ["ordered", "unordered"];

function getMenuItems(currencies) {
  return currencies.map((currency, index) => {
    return (
      <MenuItem key={index} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
}

const getDropdownMenuItems = (types) => {
  return types.map((type, index) => {
    return (
      <MenuItem key={index} value={type}>
        {strings.subproject[`workflow_mode_${type}`]}
      </MenuItem>
    );
  });
};

const SubProjectDialogContent = (props) => {
  const currencies = getCurrencies();
  const { editDialogShown, storeFixedWorkflowitemType } = props;
  // creation of restricted workflow item types is deprecated
  // all new subprojects will have general workflow item types
  useEffect(() => {
    if (!editDialogShown) {
      storeFixedWorkflowitemType("general");
    }
  }, [editDialogShown, storeFixedWorkflowitemType]);

  return (
    <div data-test="subproject-dialog-content">
      <div>
        <Identifier
          nameLabel={strings.subproject.subproject_title}
          nameHintText={strings.subproject.subproject_title_description}
          name={trimSpecialChars(props.subprojectToAdd.displayName)}
          nameOnChange={props.storeSubProjectName}
          commentLabel={strings.subproject.subproject_comment}
          commentHintText={strings.common.comment_description}
          comment={props.subprojectToAdd.description}
          commentOnChange={props.storeSubProjectComment}
        />
        {!props.editDialogShown ? (
          <>
            <div className="sub-project-dialog-container">
              <div className="sub-project-dialog-input-container">
                <Dropdown
                  className="dropdown"
                  value={props.subprojectToAdd.currency}
                  floatingLabel={strings.subproject.subproject_currency}
                  onChange={(v) => props.storeSubProjectCurrency(v)}
                  id="sp-dialog-currencies"
                >
                  {getMenuItems(currencies)}
                </Dropdown>
              </div>

              <div className="sub-project-dialog-input-container">
                <Dropdown
                  className="dropdown"
                  floatingLabel={strings.subproject.workflow_mode}
                  value={props.subprojectToAdd.workflowMode}
                  onChange={(value) => props.storeWorkflowMode(value)}
                  id="wf-mode-dropdown"
                >
                  {getDropdownMenuItems(subprojectWorkflowModes)}
                </Dropdown>
              </div>

              <div className="sub-project-dialog-input-container">
                <SingleSelection
                  selectId={props.selectedValidator}
                  selectableItems={props.users}
                  disabled={false}
                  floatingLabel={strings.subproject.workflowitem_assignee}
                  onSelect={(selectId) => props.storeSubProjectValidator(selectId)}
                  onClearItem={() => props.storeSubProjectValidator("")}
                />
                <CustomInfoTooltip
                  title={`${strings.subproject.default_assignee_warning} ${strings.subproject.default_assignee_warning2}`}
                  iconType="warning"
                />
              </div>
            </div>
            <Alert severity="warning">{strings.subproject.default_assignee_warning}</Alert>
          </>
        ) : null}
      </div>
      <Divider />
      <div>
        <Budget
          projectedBudgets={props.subprojectToAdd.projectedBudgets}
          deletedProjectedBudgets={props.subprojectToAdd.deletedProjectedBudgets}
          addProjectedBudget={props.addSubProjectProjectedBudget}
          editProjectedBudget={props.editSubProjectProjectedBudgetAmount}
          storeDeletedProjectedBudget={props.storeDeletedProjectedBudget}
          projectProjectedBudgets={props.projectProjectedBudgets}
        />
      </div>
    </div>
  );
};

export default SubProjectDialogContent;
