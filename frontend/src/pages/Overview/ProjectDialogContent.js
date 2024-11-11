import React from "react";

import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";

import { trimSpecialChars } from "../../helper";
import strings from "../../localizeStrings";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import ImageSelector from "../Common/ImageSelector";
import Markdown from "../Common/Markdown";
import TagEditor from "../Common/TagEditor";

const ProjectDialogContent = (props) => {
  return (
    <div>
      <div>
        <Identifier
          nameLabel={strings.project.project_title}
          nameHintText={strings.project.project_title_description}
          name={trimSpecialChars(props.projectToAdd.displayName)}
          nameOnChange={props.storeProjectName}
          commentLabel={strings.project.project_comment}
          commentHintText={strings.common.comment_description}
          comment={props.projectToAdd.description}
          commentOnChange={props.storeProjectComment}
        />
      </div>
      <Divider />
      <ImageSelector
        onTouchTap={props.storeProjectThumbnail}
        selectedImage={props.projectToAdd.thumbnail}
        setImage={props.addCustomImage}
        removeImage={props.removeCustomImage}
        customImage={props.projectToAdd.customImage}
      />
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
      <Divider />
      <div>
        <Typography variant="subtitle2">{strings.project.markdown}</Typography>
        <Markdown onChangeFunc={props.storeProjectMarkdown} markdown={props.projectToAdd.markdown} />
      </div>
    </div>
  );
};

export default ProjectDialogContent;
