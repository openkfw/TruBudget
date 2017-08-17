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
    console.log(this.props.type)
    var floatingLabelText = strings.project.project_comment
    const hintText = strings.common.comment_description

    if (this.props.type === 'subproject') {
      floatingLabelText = strings.subproject.subproject_comment
    } else if (this.props.type === 'workflow') {
      floatingLabelText = strings.workflow.workflow_comment
    }
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
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
