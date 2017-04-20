import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class WorkflowStateAndAssignee extends Component {

  state = {
    stateValue: 'Open',
    assigneeValue: '',
  };

  handleState = (event, index, value) => {
      console.log('value ' + value)
      this.props.storeWorkflowState(value);

   }

   handleAssignee = (event, index, value) => {
      this.props.storeWorkflowAssignee(value);
    }


  render() {
    return (

      <div style={{
        display: 'flex',
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'space-between'
      }}>
        <SelectField onChange={this.handleAssignee} value={this.props.workflowAssignee} floatingLabelText="Assign User" style={{}}>
          <MenuItem value='User A' primaryText="User A"/>
          <MenuItem value='User B' primaryText="User B"/>
        </SelectField>
        <SelectField floatingLabelText="Status" onChange={this.handleState} value={this.props.workflowState}  disabled={this.props.disabledWorkflowState} style={{}}>
          <MenuItem value='Open' primaryText="Open"/>
          <MenuItem value='In Progress' primaryText="In Progress"/>
          <MenuItem value='Donor Approval Missing' primaryText="Donor Approval Missing"/>
          <MenuItem value='Approved' primaryText="Approved"/>
          <MenuItem value='Closed' primaryText="Closed"/>
        </SelectField>

      </div>
    );
  }
}
export default WorkflowStateAndAssignee;
