import React from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import strings from '../../localizeStrings'


const styles = {

  radioButton: {
    marginBottom: 16,
  },
  div: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

const WorkflowType = ({ workflowType, storeWorkflowType, editMode }) => {
  return (
    <div style={styles.div}>
      <RadioButtonGroup name="radioGroup" defaultSelected={workflowType} onChange={(event, value) => storeWorkflowType(value)}>
        <RadioButton
          value="workflow"
          label={strings.workflow.workflow_type_workflow}
          disabled={editMode}
          style={styles.radioButton}
        />
        <RadioButton
          value="transaction"
          label={strings.workflow.workflow_type_transaction}
          disabled={editMode}
          style={styles.radioButton}
        />
      </RadioButtonGroup>
    </div>
  )
}
export default WorkflowType;
