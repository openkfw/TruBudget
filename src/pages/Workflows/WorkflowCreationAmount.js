import React, { Component } from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import Dropdown from '../Common/Dropdown';
import TextInput from '../Common/TextInput';
import strings from '../../localizeStrings'
import { getCurrencies, preselectCurrency } from '../../helper';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
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

class WorkflowCreationAmount extends Component {

  componentWillMount() {
    preselectCurrency(this.props.subProjectCurrency, this.props.storeWorkflowCurrency)
  }

  render() {
    const {
      storeWorkflowAmount,
      storeWorkflowAmountType,
      storeWorkflowCurrency,
      workflowCurrency,
      workflowAmount,
      workflowAmountType,
      subProjectCurrency,
    } = this.props;

    const floatingLabelText = strings.workflow.workflow_budget;
    const hintText = strings.workflow.workflow_budget_description;
    const currencies = getCurrencies(subProjectCurrency);

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
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: '10px'
        }}>
          <div>
            <TextInput
              floatingLabelText={floatingLabelText}
              hintText={hintText}
              type='number'
              value={workflowAmount}
              disabled={workflowAmountType === 'na'}
              onChange={storeWorkflowAmount}
            />
          </div>
          <div style={{ marginLeft: '30px' }}>
            <Dropdown
              title={strings.project.project_currency}
              value={workflowCurrency}
              onChange={storeWorkflowCurrency}
              items={currencies}
            />
          </div>
        </div>

      </div>
    );
  }
}
export default WorkflowCreationAmount;
