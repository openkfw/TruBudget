import React, { Component } from "react";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import strings from "../../localizeStrings";
import { preselectCurrency, toAmountString } from "../../helper";
import Budget from "../Common/Budget";

const styles = {
  container: {
    marginTop: 20,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center"
  },
  selections: {
    display: "flex",
    flexDirection: "row"
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
    const budgetDisabled = workflowAmountType === "N/A";
    return (
      <div style={styles.container}>
        <div>
          <RadioGroup
            style={styles.selections}
            name="workflowAmountType"
            value={workflowAmountType}
            onChange={(event, value) => storeWorkflowAmountType(value)}
          >
            <FormControlLabel
              value="N/A"
              control={<Radio color="primary" />}
              label={strings.workflow.workflow_budget_na}
            />
            <FormControlLabel
              value="allocated"
              control={<Radio color="primary" />}
              label={strings.workflow.workflow_budget_allocated}
            />
            <FormControlLabel
              value="disbursed"
              control={<Radio color="primary" />}
              label={strings.workflow.workflow_budget_disbursed}
            />
          </RadioGroup>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
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
            disabled={budgetDisabled}
          />
        </div>
      </div>
    );
  }
}
export default WorkflowCreationAmount;
