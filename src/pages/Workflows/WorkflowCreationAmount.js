import React, { Component } from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';

import ProjectCreationCurrency from '../Overview/ProjectCreationCurrency';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  selections: {
    display: 'flex',
  },
  buttons: {
    width: 'auto',
    whiteSpace: 'nowrap',
    marginLeft: '20px',
    marginRight: '20px'
  }
}

const WorkflowCreationAmount = (props) => {
  const {
    storeWorkflowAmount,
    storeWorkflowAmountType,
    storeWorkflowCurrency,
    workflowCurrency,
    workflowAmount,
    workflowAmountType,
    type
  } = props;

  const floatingLabelText = "Workflow budget amount";
  const hintText = "Budget amount for the workflow";

  return (
    <div style={styles.container}>
      <div>
        <RadioButtonGroup style={styles.selections} name="shipSpeed" defaultSelected={workflowAmountType} onChange={(event, value) => storeWorkflowAmountType(value)}>
          <RadioButton
            style={styles.buttons}
            value="na"
            label="Not applicable"
          />
          <RadioButton
            style={styles.buttons}
            value="allocated"
            label="allocated"
          />
          <RadioButton
            style={styles.buttons}
            value="ludicrous"
            label="not disbursed"
          />
        </RadioButtonGroup>
      </div>
      <div>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          type='number'
          value={workflowAmount}
          onChange={(event) => storeWorkflowAmount(event.target.value)}
        />
        <ProjectCreationCurrency storeProjectCurrency={storeWorkflowCurrency} projectCurrency={workflowCurrency} />
      </div>

    </div>
  );
}

export default WorkflowCreationAmount;
