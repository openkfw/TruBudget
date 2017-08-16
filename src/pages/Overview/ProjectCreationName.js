import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import strings from '../../localizeStrings'
class ProjectCreationName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeProjectName(event.target.value);
  };

  render() {
    var floatingLabelText = strings.project.project_title
    var hintText = strings.project.project_title_description
    if (this.props.type === 'subproject') {
      floatingLabelText = strings.subproject.subproject_title
      hintText = strings.subproject.subproject_title_description
    } else if (this.props.type === 'workflow') {
      floatingLabelText = strings.workflow.workflow_title
      hintText = strings.workflow.workflow_title_description
    }
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          value={this.props.projectName}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationName;
