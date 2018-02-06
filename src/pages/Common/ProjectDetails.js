import React from 'react';
import ProjectCreationName from '../Overview/ProjectCreationName';
import ProjectCreationAmount from '../Overview/ProjectCreationAmount';
import ProjectCreationComment from '../Overview/ProjectCreationComment';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import strings from '../../localizeStrings'

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  divider: {
    width: '100%'
  },
}

const ProjectDetails = (props) => {
  const floatingLabelText = strings.project.project_title
  const hintText = strings.project.project_title_description
  var commentFloat = strings.project.project_comment
  const commentHint = strings.common.comment_description
  return (
    <div>
      <div style={styles.inputDiv}>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          value={props.projectName}
          onChange={(event) => props.storeProjectName(event.target.value)}
        />
        <TextField
          aria-label="commentinput"
          multiLine={true}
          floatingLabelText={commentFloat}
          hintText={commentHint}
          value={props.projectComment}
          onChange={(event) => props.storeProjectComment(event.target.value)}
        />
      </div>
      <Divider />

      <ProjectCreationName storeProjectName={props.storeProjectName} projectName={props.projectName} type={props.type} />
      <ProjectCreationAmount storeProjectAmount={props.storeProjectAmount} storeProjectCurrency={props.storeProjectCurrency} projectAmount={props.projectAmount} projectCurrency={props.projectCurrency} parentCurrency={props.parentCurrency} type={props.type} />
    </div>
  )

}

export default ProjectDetails;
