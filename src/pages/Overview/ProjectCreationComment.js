import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

class ProjectCreationPurpose extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeProjectPurpose(event.target.value);
  };

  render() {
    const hintText = "Add some comments"
    var floatingLabelText = "Project Comment"

    if (this.props.type === 'subproject') {
      floatingLabelText = "Sub-project comment"
    } else if (this.props.type === 'workflow') {
      floatingLabelText = "Workflow Comment"
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
          value={this.props.projectPurpose}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationPurpose;
