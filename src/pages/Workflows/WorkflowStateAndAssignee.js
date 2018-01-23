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
    const { workflowState, editMode, workflowApprovalRequired } = this.props;
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <SelectField floatingLabelText={strings.common.status} onChange={this.handleState} value={workflowState} disabled={!editMode} style={{}}>
          <MenuItem value='open' primaryText={strings.common.open} />
          <MenuItem value='in_progress' primaryText={strings.common.in_progress} />
          {workflowApprovalRequired ? <MenuItem value='in_review' primaryText={strings.workflow.workflow_submit_for_review} /> : ''}
          <MenuItem disabled={true} value='done' primaryText={strings.common.done} />
        </SelectField>
      </div>
    );
  }
}
export default WorkflowStateAndAssignee;
