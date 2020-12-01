import React from "react";
import Divider from "@material-ui/core/Divider";
import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import SingleSelection from "../Common/SingleSelection";
import { getCurrencies } from "../../helper";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";

const subprojectWorkflowItemTypes = ["any", "general", "restricted"];

const styles = {
  dropdown: {
    minWidth: 200
  },
  inputContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 15,
    padding: 8
  },
  deleteButton: {
    width: 15,
    height: 15,
    marginTop: 10
  },
  container: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
    display: "flex",
    justifyContent: "space-evenly"
  },
  validatorContainer: { marginTop: 30, marginRight: 10, width: 200 }
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

const getDropdownMenuItems = types => {
  return types.map((type, index) => {
    return (
      <MenuItem key={index} value={type}>
        {type}
      </MenuItem>
    );
  });
};

const SubprojectDialogContent = props => {
  const currencies = getCurrencies();

  const subprojectWorkflowItemTypesDescription = {
    any: strings.subproject.subproject_any_workflowitem_type,
    general: strings.subproject.subproject_general_workflowitem_type,
    restricted: strings.subproject.subproject_restricted_workflowitem_type
  };

  const getWorkflowitemTypeInfo = type => {
    switch (type) {
      case "any":
        return subprojectWorkflowItemTypesDescription.any;
      case "general":
        return subprojectWorkflowItemTypesDescription.general;
      case "restricted":
        return subprojectWorkflowItemTypesDescription.restricted;
      default:
        return subprojectWorkflowItemTypesDescription.any;
    }
  };

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
          <div style={styles.container}>
            <div style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdown}
                value={props.subprojectToAdd.currency}
                floatingLabel={strings.subproject.subproject_currency}
                onChange={v => props.storeSubProjectCurrency(v)}
                id="sp-dialog-currencies"
              >
                {getMenuItems(currencies)}
              </Dropdown>
            </div>

            <div style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdown}
                floatingLabel={strings.workflow.workflowitem_type}
                value={props.selectedWorkflowitemType}
                onChange={value => props.storeFixedWorkflowitemType(value)}
                id="types"
              >
                {getDropdownMenuItems(subprojectWorkflowItemTypes)}
              </Dropdown>
              <Tooltip title={getWorkflowitemTypeInfo(props.selectedWorkflowitemType)} placement="right">
                <InfoOutlinedIcon style={styles.infoIcon} />
              </Tooltip>
            </div>

            <div style={styles.inputContainer}>
              <div style={styles.validatorContainer}>
                <SingleSelection
                  selectId={props.selectedValidator}
                  selectableItems={props.users}
                  disabled={false}
                  floatingLabel={strings.subproject.subproject_validator}
                  onSelect={(selectId, displayName) => props.storeSubProjectValidator(selectId)}
                />
              </div>
              <IconButton
                data-test={"clear-validator"}
                style={styles.deleteButton}
                onClick={() => props.storeSubProjectValidator("")}
              >
                <CancelIcon color="action" />
              </IconButton>
            </div>
          </div>
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
