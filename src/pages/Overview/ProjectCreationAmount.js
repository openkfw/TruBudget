import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import ProjectCreationCurrency from './ProjectCreationCurrency';
class ProjectCreationAmount extends Component {


  handleChange = (event) => {

    this.props.storeProjectAmount(event.target.value);
  };

  render() {
    var hintText = "Budget for the project"
    var floatingLabelText = "Project budget amount"
    if (this.props.type==='subProject'){
      floatingLabelText="Sub-project budget amount"
      hintText="Budget amount for the project"
    }else if (this.props.type==='workflow'){
      floatingLabelText="Workflow budget amount"
      hintText="Budget amount for the workflow"
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
