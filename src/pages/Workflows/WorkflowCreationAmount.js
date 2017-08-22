import React from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';

import ProjectCreationCurrency from '../Overview/ProjectCreationCurrency';
import strings from '../../localizeStrings'
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
    subProjectCurrency,
  } = props;
  const floatingLabelText = strings.workflow.workflow_budget;
  const hintText = strings.workflow.workflow_budget_description;
  return (
    <div style={styles.container}>
      <div>
        <RadioButtonGroup style={styles.selections} name="shipSpeed" defaultSelected={workflowAmountType} onChange={(event, value) => storeWorkflowAmountType(value)}>
          <RadioButton
            style={styles.buttons}
            value="na"
            label={strings.workflow.workflow_budget_na}
          />
          <RadioButton
            style={styles.buttons}
            value="allocated"
            label={strings.workflow.workflow_budget_allocated}
          />
          <RadioButton
            style={styles.buttons}
            value="disbursed"
            label={strings.workflow.workflow_budget_disbursed}
          />
        </RadioButtonGroup>
      </div>
      <div style={{
        width: '90%',
        left: '20%',
        position: 'relative',
        borderCOlor: 'red',
        borderWidth: 2
      }}>
        <TextField
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          type='number'
          value={workflowAmount}
          disabled={workflowAmountType === 'na'}
          onChange={(event) => storeWorkflowAmount(event.target.value)}
        />
        <ProjectCreationCurrency parentCurrency={subProjectCurrency} storeProjectCurrency={storeWorkflowCurrency} projectCurrency={workflowCurrency} />
      </div>

    </div>
  );
}

export default WorkflowCreationAmount;
