import React, { useEffect, useState } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import MenuItem from "@material-ui/core/MenuItem";
import DropwDown from "../Common/NewDropdown";
import TextField from "@material-ui/core/TextField";
import strings from "../../localizeStrings";
import _isEmpty from "lodash/isEmpty";
import {
  getCurrencies,
  preselectCurrency,
  toAmountString,
  fromAmountString,
  validateLanguagePattern,
  numberSignsRegex
} from "../../helper";
import Typography from "@material-ui/core/Typography";

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

const WorkflowDialogAmount = props => {
  const {
    workflowCurrency,
    subProjectCurrency,
    storeWorkflowCurrency,
    workflowAmountType,
    storeWorkflowAmountType
  } = props;
  const budgetDisabled = workflowAmountType === "N/A";
  const [isWorkflowAmountValid, setIsWorkflowAmountValid] = useState(true);
  const [isWorkflowExchangeRateValid, setIsWorkflowExchangeRateValid] = useState(true);

  useEffect(() => {
    const currency = workflowCurrency ? workflowCurrency : subProjectCurrency;
    preselectCurrency(currency, storeWorkflowCurrency);
  }, [workflowCurrency, subProjectCurrency, storeWorkflowCurrency]);

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
            data-test="amount-type-na"
          />
          <FormControlLabel
            value="allocated"
            control={<Radio color="primary" />}
            label={strings.workflow.workflow_budget_allocated}
            data-test="amount-type-allocated"
          />
          <FormControlLabel
            value="disbursed"
            control={<Radio color="primary" />}
            label={strings.workflow.workflow_budget_disbursed}
            data-test="amount-type-disbursed"
          />
        </RadioGroup>
      </div>
      {!budgetDisabled
        ? showAmountInputFields(
            props,
            isWorkflowAmountValid,
            setIsWorkflowAmountValid,
            isWorkflowExchangeRateValid,
            setIsWorkflowExchangeRateValid
          )
        : null}
    </div>
  );
};

const getMenuItems = currencies => {
  return currencies.map((currency, index) => {
    return (
      <MenuItem key={index} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
};

const showAmountInputFields = (
  {
    storeWorkflowAmount,
    storeWorkflowCurrency,
    workflowCurrency,
    workflowAmount,
    subProjectCurrency,
    storeWorkflowExchangeRate,
    exchangeRate,
    defaultWorkflowExchangeRate
  },
  isWorkflowAmountValid,
  setIsWorkflowAmountValid,
  isWorkflowExchangeRateValid,
  setIsWorkflowExchangeRateValid
) => {
  const currencies = getCurrencies();
  const floatingLabelText = strings.workflow.workflow_budget;
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
        floatingLabel={strings.common.currency}
        value={workflowCurrency}
        onChange={value => {
          if (value === subProjectCurrency) {
            defaultWorkflowExchangeRate();
          }
          return storeWorkflowCurrency(value);
        }}
        id="currencies"
      >
        {getMenuItems(currencies)}
      </DropwDown>
      <TextField
        label={floatingLabelText}
        value={workflowAmount}
        onChange={v => {
          if (numberSignsRegex.test(v.target.value)) {
            storeWorkflowAmount(v.target.value);
            setIsWorkflowAmountValid(validateLanguagePattern(v.target.value) || _isEmpty(v.target.value));
          }
        }}
        error={!isWorkflowAmountValid}
        helperText={!isWorkflowAmountValid ? strings.common.invalid_format : ""}
        type="text"
        multiline={false}
        aria-label="amount"
        data-test="amountinput"
        style={{
          width: "20%",
          paddingRight: 20
        }}
      />
      <Typography style={{ alignSelf: "center", marginRight: "16px" }}>x</Typography>
      <TextField
        label={strings.workflow.exchange_rate}
        value={exchangeRate}
        onChange={v => {
          if (numberSignsRegex.test(v.target.value)) {
            storeWorkflowExchangeRate(v.target.value);
            setIsWorkflowExchangeRateValid(validateLanguagePattern(v.target.value) || _isEmpty(v.target.value));
          }
        }}
        error={!isWorkflowExchangeRateValid}
        helperText={!isWorkflowExchangeRateValid ? strings.common.invalid_format : ""}
        type="text"
        aria-label="rate"
        data-test="rateinput"
        disabled={workflowCurrency === subProjectCurrency}
        style={{
          width: "20%",
          paddingRight: 20
        }}
      />
      <div style={{ alignSelf: "center", marginRight: "16px", display: "flex" }}>
        <Typography
          style={{ alignSelf: "center", marginRight: "16px", fontSize: "16px" }}
          data-test="calculated-result"
        >
          {"= " + subProjectCurrency + " "}
          {exchangeRate ? toAmountString(fromAmountString(workflowAmount) * fromAmountString(exchangeRate)) : "-"}
        </Typography>
      </div>
    </div>
  );
};

export default WorkflowDialogAmount;
