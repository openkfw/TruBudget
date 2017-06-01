import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class WorkflowStateAndAssignee extends Component {

  handleState = (event, index, value) => {
    this.props.storeWorkflowState(value);

  }

  handleAssignee = (event, index, value) => {
    this.props.storeWorkflowAssignee(value);
  }

  createUserSelection = () => {
    const { users } = this.props;
    let menuItems = [];
    let index = 0;

    for (const id in users) {
      const user = users[id];
      menuItems.push(<MenuItem key={index} value={id} primaryText={user.name + ' - ' + user.organization} />)
      index++;
    }

    return menuItems;
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'space-between'
      }}>
        <SelectField autoWidth={true} onChange={this.handleAssignee} value={this.props.workflowAssignee} floatingLabelText="Assign User" style={{}}>
          {this.createUserSelection()}
        </SelectField>
        <SelectField floatingLabelText="Status" onChange={this.handleState} value={this.props.workflowState} disabled={!this.props.editMode} style={{}}>
          <MenuItem value='open' primaryText="Open" />
          <MenuItem value='in_progress' primaryText="In Progress" />
          <MenuItem value='review' primaryText="Submit for Review" />
          <MenuItem value='done' primaryText="Done" />
        </SelectField>

      </div>
    );
  }
}
export default WorkflowStateAndAssignee;
