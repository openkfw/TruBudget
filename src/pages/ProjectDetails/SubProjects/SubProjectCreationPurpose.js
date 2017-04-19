import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

class SubProjectCreationPurpose extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeSubProjectPurpose(event.target.value);
  };

  render() {
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText="Sub-project purpose"
          hintText="Define the purpose of the sub-project"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default SubProjectCreationPurpose;
