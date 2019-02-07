import React, { Component } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import _isEmpty from "lodash/isEmpty";

import DropwDown from "./NewDropdown";
import TextInput from "./TextInput";

import { getCurrencies, preselectCurrency, fromAmountString, toAmountString } from "../../helper";
import { withStyles } from "@material-ui/core";

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "red"
  }
};
class Budget extends Component {
  componentWillMount() {
    if (_isEmpty(this.props.currency)) {
      preselectCurrency(this.props.parentCurrency, this.props.storeCurrency);
    }
  }

  getMenuItems(currencies) {
    return currencies.map((currency, index) => {
      return (
        <MenuItem key={index} value={currency.value} disabled={currency.disabled}>
          {currency.primaryText}
        </MenuItem>
      );
    });
  }
  render() {
    const {
      parentCurrency,
      currencyTitle,
      currency,
      storeCurrency,
      budgetLabel,
      budgetHintText,
      budget,
      storeBudget,
      disabled
    } = this.props;
    const currencies = getCurrencies(parentCurrency);
    return (
      <div style={styles.inputDiv}>
        <DropwDown
          style={{ minWidth: 160 }}
          floatingLabel={currencyTitle}
          value={currency}
          onChange={storeCurrency}
          disabled={disabled}
          id="currencies"
        >
          {this.getMenuItems(currencies)}
        </DropwDown>
        <TextInput
          label={budgetLabel}
          helperText={budgetHintText}
          value={budget}
          onChange={v => {
            if (/^[0-9,.-]*$/.test(v)) storeBudget(v);
          }}
          onBlur={e => storeBudget(toAmountString(e.target.value))}
          onFocus={() => storeBudget(fromAmountString(budget))}
          type="number"
          aria-label="amount"
          disabled={disabled}
          id="amountinput"
        />
      </div>
    );
  }
}
export default withStyles(styles)(Budget);
