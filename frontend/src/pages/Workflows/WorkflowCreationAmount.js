import React, { Component } from "react";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";

import strings from "../../localizeStrings";
import { preselectCurrency, toAmountString } from "../../helper";
import Budget from "../Common/Budget";

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center"
  },
  selections: {
    display: "flex"
  },
  buttons: {
    width: "auto",
    whiteSpace: "nowrap",
    marginLeft: "20px",
    marginRight: "20px"
  }
};

class WorkflowCreationAmount extends Component {
  componentWillMount() {
    preselectCurrency(this.props.subProjectCurrency, this.props.storeWorkflowCurrency);
  }

  render() {
    const {
      storeWorkflowAmount,
      storeWorkflowAmountType,
      storeWorkflowCurrency,
      workflowCurrency,
      workflowAmount,
      workflowAmountType,
      subProjectCurrency
    } = this.props;

    const floatingLabelText = strings.workflow.workflow_budget;
    const hintText = strings.workflow.workflow_budget_description;

    return (
      <div style={styles.container}>
        <div>
          <RadioButtonGroup
            style={styles.selections}
            name="workflowAmountType"
            defaultSelected={workflowAmountType}
            onChange={(event, value) => storeWorkflowAmountType(value)}
          >
            <RadioButton style={styles.buttons} value="N/A" label={strings.workflow.workflow_budget_na} />
            <RadioButton style={styles.buttons} value="allocated" label={strings.workflow.workflow_budget_allocated} />
            <RadioButton style={styles.buttons} value="disbursed" label={strings.workflow.workflow_budget_disbursed} />
          </RadioButtonGroup>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: "10px"
          }}
        >
          <Budget
            currencyTitle={strings.project.project_currency}
            currency={workflowCurrency}
            storeCurrency={storeWorkflowCurrency}
            parentCurrency={subProjectCurrency}
            budgetLabel={floatingLabelText}
            budgetHintText={hintText + " " + toAmountString(99999.99)}
            budget={workflowAmount}
            storeBudget={storeWorkflowAmount}
            budgetDisabled={workflowAmountType === "N/A"}
          />
        </div>
      </div>
    );
  }
}
export default WorkflowCreationAmount;
