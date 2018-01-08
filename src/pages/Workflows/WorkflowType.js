import React from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import strings from '../../localizeStrings'


const styles = {

  radioButton: {
    marginBottom: 16,
  },
  div: {
    marginTop: '15px',
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    marginBottom: 16,
  },
  radioButtonDiv: {
    marginRight: '75px'
  },
  checkBoxDiv: {
    marginLeft: '75px'
  },
  checkBoxLabel: {
    width: '140px'
  }

};

const WorkflowType = ({workflowType, isWorkflowApprovalRequired, storeWorkflowType, editMode, workflowApprovalRequired}) => {
  return (
    <div style={ styles.div }>
      <div style={ styles.radioButtonDiv }>
        <RadioButtonGroup name="radioGroup" defaultSelected={ workflowType } onChange={ (event, value) => storeWorkflowType(value) }>
          <RadioButton value="workflow" label={ strings.workflow.workflow_type_workflow } disabled={ editMode } style={ styles.radioButton } />
          <RadioButton value="transaction" label={ strings.workflow.workflow_type_transaction } disabled={ editMode } style={ styles.radioButton } />
        </RadioButtonGroup>
      </div>
      <div style={ styles.checkBoxDiv }>
        <Checkbox label="Approval Required" style={ styles.checkbox } labelStyle={ styles.checkBoxLabel } disabled={ editMode } checked={ workflowApprovalRequired } onCheck={ (event, isInputChecked) => isWorkflowApprovalRequired(isInputChecked) }
        />
      </div>
    </div>
  )
}
export default WorkflowType;
