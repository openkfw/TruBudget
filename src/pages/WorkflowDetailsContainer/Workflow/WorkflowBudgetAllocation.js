import React from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const WorkflowBudgetAllocation = ({history, location, workflowItems, title}) => {

  return (
    <div>
      <h2 style={{
        fontSize: 24,
        fontWeight: 400
      }}>{title}</h2>
      <SelectField floatingLabelText="Assign User" style={{
        left: '59%',
        top: '15px'
      }}>
        <MenuItem value={1} primaryText="User A"/>
        <MenuItem value={2} primaryText="User B"/>
      </SelectField>
      <SelectField floatingLabelText="Status" value={1} disabled={true} style={{
        left: '34.5%',
        top: '120px'
      }}>
        <MenuItem value={1} primaryText="Open"/>
      </SelectField>
      <div>
        <SelectField floatingLabelText="Order" style={{
          left: '5%',
          top: '-60px'
        }}>
          <MenuItem value={1} primaryText="1"/>
          <MenuItem value={2} primaryText="2"/>
        </SelectField>
      </div>
      <div>
        <TextField style={{
          left: '5%',
          top: '-65px'
        }} floatingLabelText="Amount" type='number' hintText="Workflow Amount"/>
      </div>
      <div>
        <TextField style={{
          left: '5%',
          top: '-60px'
        }} floatingLabelText="Purpose" hintText="Workflow Purpose" multiLine={true} rows={2}/>
      </div>

    </div>

  )
}

export default WorkflowBudgetAllocation;
