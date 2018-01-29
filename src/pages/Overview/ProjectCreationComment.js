import React, { Component } from 'react';
import strings from '../../localizeStrings'
import TextField from 'material-ui/TextField';

class ProjectCreationComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeProjectComment(event.target.value);
  };

  render() {
    var floatingLabelText = strings.project.project_comment
    const hintText = strings.common.comment_description
    let marginTop = '6px'
    if (this.props.type === 'subproject') {
      floatingLabelText = strings.subproject.subproject_comment
    } else if (this.props.type === 'workflow') {
      floatingLabelText = strings.workflow.workflow_comment
      marginTop = '0px'
    }
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: marginTop
      }}>
        <TextField
          aria-label="commentinput"
          multiLine={true}
          rows={2}
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          value={this.props.projectComment}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationComment;
