import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

class ProjectCreationAdditionalData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeWorkflowAdditionalData(event.target.value);
  };

  render() {
    var hintText = "Add additional data"
    var floatingLabelText = "Additional Data"

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
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationAdditionalData;
