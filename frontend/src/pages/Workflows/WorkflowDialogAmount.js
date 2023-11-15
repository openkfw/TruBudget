import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";

import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  fromAmountString,
  getCurrencies,
  numberSignsRegex,
  preselectCurrency,
  toAmountString,
  validateLanguagePattern
} from "../../helper";
import strings from "../../localizeStrings";
import DropDown from "../Common/NewDropdown";

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

const WorkflowDialogAmount = (props) => {
  const {
    workflowCurrency,
    subProjectCurrency,
    storeWorkflowCurrency,
    workflowAmountType,
    storeWorkflowAmountType,
    disabled
  } = props;
  const budgetDisabled = workflowAmountType === "N/A" || disabled;
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
          onChange={(_event, value) => storeWorkflowAmountType(value)}
        >
          <FormControlLabel
            value="N/A"
            control={<Radio color="primary" />}
            label={strings.workflow.workflow_budget_na}
            data-test="amount-type-na"
            disabled={disabled}
          />
          <FormControlLabel
            value="allocated"
            control={<Radio color="primary" />}
            label={strings.workflow.workflow_budget_allocated}
            data-test="amount-type-allocated"
            disabled={disabled}
          />
          <FormControlLabel
            value="disbursed"
            control={<Radio color="primary" />}
            label={strings.workflow.workflow_budget_disbursed}
            data-test="amount-type-disbursed"
            disabled={disabled}
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

const getMenuItems = (currencies) => {
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
      <DropDown
        style={{ minWidth: 160 }}
        floatingLabel={strings.common.currency}
        value={workflowCurrency}
        onChange={(value) => {
          if (value === subProjectCurrency) {
            defaultWorkflowExchangeRate();
          }
          return storeWorkflowCurrency(value);
        }}
        id="currencies"
      >
        {getMenuItems(currencies)}
      </DropDown>
      <TextField
        variant="standard"
        label={floatingLabelText}
        value={workflowAmount}
        onChange={(v) => {
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
        variant="standard"
        label={strings.workflow.exchange_rate}
        value={exchangeRate}
        onChange={(v) => {
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
