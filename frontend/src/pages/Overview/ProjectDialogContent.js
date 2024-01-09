import React from "react";

import Divider from "@mui/material/Divider";

import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import ImageSelector from "../Common/ImageSelector";
import TagEditor from "../Common/TagEditor";

const ProjectDialogContent = (props) => {
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
          projectedBudgets={props.projectToAdd.projectedBudgets}
          deletedProjectedBudgets={props.projectToAdd.deletedProjectedBudgets}
          addProjectedBudget={props.addProjectProjectedBudget}
          editProjectedBudget={props.editProjectProjectedBudgetAmount}
          storeDeletedProjectedBudget={props.storeDeletedProjectedBudget}
        />
      </div>
      <div>
        <TagEditor
          addProjectTag={props.addProjectTag}
          removeProjectTag={props.removeProjectTag}
          projectTags={props.projectToAdd.tags}
          tagText={strings.common.add_tag_text}
        />
      </div>
    </div>
  );
};

export default ProjectDialogContent;
