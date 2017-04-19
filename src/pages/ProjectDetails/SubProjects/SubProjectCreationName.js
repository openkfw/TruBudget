import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

class SubProjectCreationName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeSubProjectName(event.target.value);
  };

  render() {
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative',
      }}>
        <TextField
          floatingLabelText="Name"
          hintText="Title of the Sub-project"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default SubProjectCreationName;
