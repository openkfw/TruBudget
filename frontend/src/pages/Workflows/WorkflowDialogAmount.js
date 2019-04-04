import React, { Component } from "react";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import MenuItem from "@material-ui/core/MenuItem";
import DropwDown from "../Common/NewDropdown";
import TextField from "@material-ui/core/TextField";

import strings from "../../localizeStrings";
import { getCurrencies, preselectCurrency, toAmountString, fromAmountString } from "../../helper";
import { Typography } from "@material-ui/core";

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

class WorkflowDialogAmount extends Component {
  componentWillMount() {
    preselectCurrency(
      this.props.workflowCurrency ? this.props.workflowCurrency : this.props.subProjectCurrency,
      this.props.storeWorkflowCurrency
    );
  }

  getMenuItems(currencies) {
    return currencies.map((currency, index) => {
      return (
        <MenuItem key={index} value={currency.value}>
          {currency.primaryText}
        </MenuItem>
      );
    });
  }

  render() {
    const { storeWorkflowAmountType, workflowAmountType } = this.props;
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
        {!budgetDisabled ? this.showAmountInputFields(this.props) : null}
      </div>
    );
  }

  showAmountInputFields(props) {
    const {
      storeWorkflowAmount,
      storeWorkflowCurrency,
      workflowCurrency,
      workflowAmount,
      subProjectCurrency,
      storeWorkflowExchangeRate,
      exchangeRate
    } = props;
    const currencies = getCurrencies(subProjectCurrency);
    const floatingLabelText = strings.workflow.workflow_budget;
    const hintText = strings.workflow.workflow_budget_description;
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center"
        }}
      >
        <DropwDown
          style={{ minWidth: 160 }}
          floatingLabel={strings.project.project_currency}
          value={workflowCurrency}
          onChange={value => {
            if (value === this.props.subProjectCurrency) {
              this.props.defaultWorkflowExchangeRate();
            }
            return storeWorkflowCurrency(value);
          }}
          id="currencies"
        >
          {this.getMenuItems(currencies)}
        </DropwDown>
        <TextField
          label={floatingLabelText}
          helperText={hintText + " " + toAmountString(99999.99)}
          value={workflowAmount}
          onChange={v => {
            if (/^[0-9,.-]*$/.test(v.target.value)) storeWorkflowAmount(v.target.value);
          }}
          onBlur={e => storeWorkflowAmount(toAmountString(e.target.value))}
          onFocus={() => storeWorkflowAmount(fromAmountString(workflowAmount))}
          type="text"
          multiline={false}
          aria-label="amount"
          id="amountinput"
          style={{
            width: "20%",
            paddingRight: 20
          }}
        />
        <Typography style={{ alignSelf: "center", marginRight: "16px" }}>x</Typography>
        <TextField
          label={strings.workflow.exchange_rate}
          helperText={strings.workflow.workflow_budget_description + "1.1586"}
          value={exchangeRate ? exchangeRate : ""}
          onChange={e => {
            if (/^[0-9,.]*$/.test(e.target.value)) storeWorkflowExchangeRate(parseFloat(e.target.value));
          }}
          type="number"
          aria-label="rate"
          id="rateinput"
          disabled={workflowCurrency === subProjectCurrency}
          style={{
            width: "20%",
            paddingRight: 20
          }}
        />
        <div style={{ alignSelf: "center", marginRight: "16px", display: "flex" }}>
          <Typography style={{ alignSelf: "center", marginRight: "16px", fontSize: "16px" }}>
            {"= " + subProjectCurrency + " "}
            {exchangeRate ? toAmountString(fromAmountString(workflowAmount) * exchangeRate) : "-"}
          </Typography>
        </div>
      </div>
    );
  }
}
export default WorkflowDialogAmount;
