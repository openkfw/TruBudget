import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import ProjectCreationCurrency from './ProjectCreationCurrency';
class ProjectCreationAmount extends Component {


  handleChange = (event) => {

    this.props.storeProjectAmount(event.target.value);
  };

  render() {
    var hintText = "Amount for your project"
    var floatingLabelText = "Project Amount"
    if (this.props.subProject){
      floatingLabelText="Sub-Project Amount"
      hintText="Amount for your project"
    }
    return (
      <div style={{
        width: '90%',
        left: '20%',
        position: 'relative'
      }}>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          type='number'
          onChange={this.handleChange}
        />
        <ProjectCreationCurrency storeProjectCurrency={this.props.storeProjectCurrency}/>
      </div>
    );
  }
}

export default ProjectCreationAmount;
