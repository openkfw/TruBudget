import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import Dropdown from "../Common/NewDropdown";
import { getCurrencies } from "../../helper";
import MenuItem from "@material-ui/core/MenuItem";

function getMenuItems(currencies) {
  return currencies.map((currency, index) => {
    return (
      <MenuItem key={index} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
}

const SubprojectDialogContent = props => {
  const currencies = getCurrencies();
  return (
    <div>
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
          <Dropdown
            style={{ minWidth: 200, marginRight: "16px", marginBottom: "32px" }}
            value={props.subprojectToAdd.currency}
            floatingLabel={strings.subproject.subproject_currency}
            onChange={v => props.storeSubProjectCurrency(v)}
            id="sp-dialog-currencies"
          >
            {getMenuItems(currencies)}
          </Dropdown>
        ) : null}
      </div>
      <Divider />
      <div>
        <Budget
          currencyTitle={strings.subproject.subproject_currency}
          budgetLabel={strings.subproject.subproject_budget_amount}
          projectedBudgets={props.subprojectToAdd.projectedBudgets}
          storeProjectedBudget={props.storeSubProjectProjectedBudgets}
          storeDeletedProjectedBudget={props.storeDeletedProjectedBudget}
          disabled={props.editDialogShown}
          projectProjectedBudgets={props.projectProjectedBudgets}
        />
      </div>
    </div>
  );
};

export default SubprojectDialogContent;
