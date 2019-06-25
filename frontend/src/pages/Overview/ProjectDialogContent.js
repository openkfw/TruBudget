import Divider from "@material-ui/core/Divider";
import React from "react";

import { toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import ImageSelector from "../Common/ImageSelector";

import TagEditor from "../Common/TagEditor";

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
      <ImageSelector onTouchTap={props.storeProjectThumbnail} selectedImage={props.projectToAdd.thumbnail} />
      <Divider />
      <div>
        <Budget
          currencyTitle={strings.project.project_currency}
          currency={props.projectToAdd.currency}
          budgetLabel={strings.project.project_budget_amount}
          budgetHintText={strings.project.project_budget_amount_description + " " + toAmountString(99999.99)}
          budget={props.projectToAdd.amount}
          storeProjectedBudget={props.storeProjectedBudget}
          organization={props.projectToAdd.organization}
          projectedBudgets={props.projectToAdd.projectedBudgets}
          deletedProjectedBudgets={props.projectToAdd.deletedProjectedBudgets}
          editDialogShown={props.editDialogShown}
          storeDeletedProjectedBudget={props.storeDeletedProjectedBudget}
          disabled={props.editDialogShown}
        />
      </div>
      <div>
        <TagEditor
          addProjectTag={props.addProjectTag}
          removeProjectTag={props.removeProjectTag}
          projectTags={props.projectToAdd.tags}
        />
      </div>
    </div>
  );
};

export default ProjectDialogContent;
