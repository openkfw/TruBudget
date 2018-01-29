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
    const { type } = this.props;
    let floatingLabelText = strings.project.project_title
    let hintText = strings.project.project_title_description
    let marginTop = '30px'
    if (type === 'subproject') {
      floatingLabelText = strings.subproject.subproject_title
      hintText = strings.subproject.subproject_title_description
    } else if (type === 'workflow') {
      floatingLabelText = strings.workflow.workflow_title
      hintText = strings.workflow.workflow_title_description
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
