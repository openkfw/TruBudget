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
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText="Project Purpose"
          hintText="Define the purpose of your project"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default ProjectCreationPurpose;
