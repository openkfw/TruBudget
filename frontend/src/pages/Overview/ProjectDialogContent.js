import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import ImageSelector from "../Common/ImageSelector";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import { toAmountString } from "../../helper";

import _isEmpty from "lodash/isEmpty";

import DropwDown from "../Common/NewDropdown";
import TextInput from "../Common/TextInput";
import MenuItem from "@material-ui/core/MenuItem";

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "red"
  }
};

const ProjectDialogContent = props => {
  let eId = 1;
  return (
    <div>
      <div>
        <Identifier
          nameLabel={strings.project.project_title}
          nameHintText={strings.project.project_title_description}
          name={props.projectToAdd.displayName}
          nameOnChange={props.storeProjectName}
          commentLabel={strings.project.project_comment}
          commentHintText={strings.common.comment_description}
          comment={props.projectToAdd.description}
          commentOnChange={props.storeProjectComment}
        />
      </div>
      <Divider />
      <div style={styles.inputDiv}>
        {props.projectToAdd.projectedBudgets.length > 0
          ? props.projectToAdd.projectedBudgets.map(item => (
              <div key={(eId += 1)}>
                <TextInput
                  // TODO organization & helper
                  value={item.organization}
                  type="string"
                  aria-label="organization"
                  disabled={true}
                  id="organizationoutput"
                />
                <DropwDown style={{ minWidth: 160 }} value={item.currencyCode} disabled={true} id="currenciesoutput">
                  <MenuItem key={`m-${eId}`} value={item.currencyCode} disabled={true}>
                    {item.currencyCode}
                  </MenuItem>
                </DropwDown>
                <TextInput value={item.value} aria-label="amount" disabled={true} id="amountoutput" />
              </div>
            ))
          : null}
      </div>
      <Divider />
      <div>
        <Budget
          currencyTitle={strings.project.project_currency}
          currency={props.projectToAdd.currency}
          storeCurrency={props.storeProjectCurrency}
          budgetLabel={strings.project.project_budget_amount}
          budgetHintText={strings.project.project_budget_amount_description + " " + toAmountString(99999.99)}
          budget={props.projectToAdd.amount}
          storeBudget={props.storeProjectAmount}
          addProjectedBudget={props.addProjectedBudget}
          organization={props.projectToAdd.organization}
          storeOrganization={props.storeProjectOrganization}
          projectedBudgets={props.projectToAdd.projectedBudgets}
        />
      </div>
      <Divider />
      <ImageSelector onTouchTap={props.storeProjectThumbnail} selectedImage={props.projectToAdd.thumbnail} />
    </div>
  );
};

export default ProjectDialogContent;
