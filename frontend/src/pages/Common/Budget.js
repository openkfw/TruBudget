import React, { Component } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import _isEmpty from "lodash/isEmpty";

import DropwDown from "./NewDropdown";
import TextInput from "./TextInput";

import { getCurrencies, preselectCurrency, fromAmountString } from "../../helper";
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
      disabled,
      classes
    } = this.props;
    const currencies = getCurrencies(parentCurrency);
    console.log(classes);
    return (
      <div style={styles.inputDiv}>
        <DropwDown
          style={{ minWidth: 160 }}
          floatingLabel={currencyTitle}
          value={currency}
          onChange={storeCurrency}
          disabled={disabled}
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
          onBlur={e => storeBudget(fromAmountString(e.target.value))}
          type="number"
          aria-label="amount"
          disabled={disabled}
        />
      </div>
    );
  }
}
export default withStyles(styles)(Budget);
