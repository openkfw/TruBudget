import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

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
    var floatingLabelText="Project Name"
    var hintText="Name of your project"
    if (this.props.type==='subproject'){
      floatingLabelText="Sub-Project Name"
      hintText="Name of your sub-project"
    }else if (this.props.type==='workflow'){
      floatingLabelText="Workflow Name"
      hintText="Name of your workflow"
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
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationName;
