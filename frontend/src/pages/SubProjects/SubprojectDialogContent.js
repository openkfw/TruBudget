import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import { Alert, IconButton } from "@mui/material";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";

import { getCurrencies } from "../../helper";
import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import SingleSelection from "../Common/SingleSelection";

const subprojectWorkflowItemTypes = ["general", "restricted"];

const styles = {
  dropdown: {
    minWidth: 200
  },
  inputContainer: {
    display: "flex",
    width: "45%",
    paddingRight: 20,
    alignItems: "center"
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 15,
    padding: 8
  },
  container: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
    display: "flex",
    justifyContent: "space-between"
  },
  clearButton: {
    width: 45,
    height: 45,
    alignSelf: "flex-end",
    marginLeft: "5px"
  }
};

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
        {type}
      </MenuItem>
    );
  });
};

const SubprojectDialogContent = (props) => {
  const currencies = getCurrencies();

  return (
    <div data-test="subproject-dialog-content">
      <div>
        <Identifier
          nameLabel={strings.subproject.subproject_title}
          nameHintText={strings.subproject.subproject_title_description}
          name={props.subprojectToAdd.displayName}
          nameOnChange={props.storeSubProjectName}
          commentLabel={strings.subproject.subproject_comment}
          commentHintText={strings.common.comment_description}
          comment={props.subprojectToAdd.description}
          commentOnChange={props.storeSubProjectComment}
        />
        {!props.editDialogShown ? (
          <>
            <div style={styles.container}>
              <div style={styles.inputContainer}>
                <Dropdown
                  style={styles.dropdown}
                  value={props.subprojectToAdd.currency}
                  floatingLabel={strings.subproject.subproject_currency}
                  onChange={(v) => props.storeSubProjectCurrency(v)}
                  id="sp-dialog-currencies"
                >
                  {getMenuItems(currencies)}
                </Dropdown>
              </div>

              <div style={styles.inputContainer}>
                <Dropdown
                  style={styles.dropdown}
                  floatingLabel={strings.subproject.fixed_workflowitem_type}
                  value={props.selectedWorkflowitemType}
                  onChange={(value) => props.storeFixedWorkflowitemType(value)}
                  id="types"
                >
                  {getDropdownMenuItems(subprojectWorkflowItemTypes)}
                </Dropdown>
                {props.selectedWorkflowitemType ? (
                  <IconButton
                    aria-label="cancel"
                    data-test={"clear-workflowitem-type"}
                    style={styles.clearButton}
                    onClick={() => props.storeFixedWorkflowitemType("")}
                    size="large"
                  >
                    <CancelIcon color="action" style={{ fontSize: "x-large" }} />
                  </IconButton>
                ) : null}
              </div>

              <div style={styles.inputContainer}>
                <SingleSelection
                  selectId={props.selectedValidator}
                  selectableItems={props.users}
                  disabled={false}
                  floatingLabel={strings.subproject.workflowitem_assignee}
                  onSelect={(selectId) => props.storeSubProjectValidator(selectId)}
                  onClearItem={() => props.storeSubProjectValidator("")}
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

export default SubprojectDialogContent;
