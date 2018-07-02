import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import { toAmountString } from "../../helper";

const SubprojectDialogContent = props => {
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
      </div>
      <Divider />
      <div>
        <Budget
          currencyTitle={strings.subproject.subproject_currency}
          currency={props.subprojectToAdd.currency}
          storeCurrency={props.storeSubProjectCurrency}
          parentCurrency={props.projectCurrency}
          budgetLabel={strings.subproject.subproject_budget_amount}
          budgetHintText={strings.subproject.subproject_budget_amount_description + " " + toAmountString(99999.99)}
          budget={props.subprojectToAdd.amount}
          storeBudget={props.storeSubProjectAmount}
        />
      </div>
    </div>
  );
};

export default SubprojectDialogContent;
