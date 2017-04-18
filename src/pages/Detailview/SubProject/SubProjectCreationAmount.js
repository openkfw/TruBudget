import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

class SubProjectCreationAmount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Property Value',
    };
  }

  handleChange = (event) => {
    this.props.storeSubProjectAmount(event.target.value);
  };

  render() {
    return (
      <div style={{
        width: '40%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText="Sub-Project Amount"
          hintText="Amount for your project"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default SubProjectCreationAmount;
