import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import Budget from "../Common/Budget2";
import Identifier from "../Common/Identifier";

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
          parentCurrency={props.projectCurrency}
          budgetLabel={strings.subproject.subproject_budget_amount}
          projectedBudgets={props.subprojectToAdd.projectedBudgets}
          addProjectedBudget={props.addSubProjectProjectedBudgets}
        />
      </div>
    </div>
  );
};

export default SubprojectDialogContent;
