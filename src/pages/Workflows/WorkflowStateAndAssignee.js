import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import strings from '../../localizeStrings'
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
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/*
        <SelectField autoWidth={true} onChange={this.handleAssignee} value={this.props.workflowAssignee} floatingLabelText="Assign User" style={{}}>
          {this.createUserSelection()}
        </SelectField> */}
        <SelectField floatingLabelText={strings.common.status} onChange={this.handleState} value={this.props.workflowState} disabled={!this.props.editMode} style={{}}>
          <MenuItem value='open' primaryText={strings.common.open} />
          <MenuItem value='in_progress' primaryText={strings.common.in_progress} />
          <MenuItem value='in_review' primaryText={strings.workflow.workflow_submit_for_review} />
          <MenuItem disabled={!this.props.isApprover} value='done' primaryText={strings.common.done} />
        </SelectField>

      </div>
    );
  }
}
export default WorkflowStateAndAssignee;
