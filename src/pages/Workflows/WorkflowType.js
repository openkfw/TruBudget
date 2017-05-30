import React from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';



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

const WorkflowType = ({ workflowType, storeWorkflowType }) => (
  <div style={styles.div}>
    <RadioButtonGroup name="shipSpeed" defaultSelected={workflowType} onChange={(event, value) => storeWorkflowType(value)}>
      <RadioButton
        value="workflow"
        label="Workflow"
        style={styles.radioButton}
      />
      <RadioButton
        value="transaction"
        label="Transaction"
        style={styles.radioButton}
      />
    </RadioButtonGroup>
  </div>
)

export default WorkflowType;
