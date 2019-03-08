import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import ImageSelector from "../Common/ImageSelector";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import { toAmountString } from "../../helper";

const ProjectDialogContent = props => {
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
          editDialogShown={props.editDialogShown}
        />
      </div>
      <Divider />
      <ImageSelector onTouchTap={props.storeProjectThumbnail} selectedImage={props.projectToAdd.thumbnail} />
    </div>
  );
};

export default ProjectDialogContent;
