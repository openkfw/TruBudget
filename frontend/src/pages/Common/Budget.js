import React, { Component } from "react";
import { MenuItem } from "material-ui/Menu";

import DropwDown from "./NewDropdown";
import TextInput from "./TextInput";

import { getCurrencies, preselectCurrency, fromAmountString } from "../../helper";

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
};

class Budget extends Component {
  componentWillMount() {
    preselectCurrency(this.props.parentCurrency, this.props.storeCurrency);
  }

  getMenuItems(currencies) {
    return currencies.map(currency => {
      return (
        <MenuItem value={currency.value} disabled={currency.disabled}>
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
      budgetDisabled
    } = this.props;
    const currencies = getCurrencies(parentCurrency);
    return (
      <div style={styles.inputDiv}>
        <DropwDown floatingLabel={currencyTitle} value={currency} onChange={storeCurrency} disabled={budgetDisabled}>
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
          disabled={budgetDisabled}
        />
      </div>
    );
  }
}
export default Budget;
