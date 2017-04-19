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
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText="Project title"
          hintText="Name of the project"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationName;
