import React, { Component } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import _isEmpty from "lodash/isEmpty";

import DropwDown from "./NewDropdown";
import TextInput from "./TextInput";
import Fab from "@material-ui/core/Fab";
import ContentAdd from "@material-ui/icons/Add";

import { getCurrencies, preselectCurrency, fromAmountString, toAmountString } from "../../helper";
import { withStyles } from "@material-ui/core";

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: "99%",
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

  addBudgetEntry() {
    return;
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
      addProjectedBudget,
      organization,
      storeOrganization,
      projectedBudgets,
      editDialogShown
    } = this.props;
    const currencies = getCurrencies(parentCurrency);
    let eId = 1;

    return (
      <div>
        {projectedBudgets && projectedBudgets.length > 0
          ? projectedBudgets.map(item => (
              <div style={styles.inputDiv} key={(eId += 1)}>
                <TextInput
                  // TODO organization & helper
                  value={item.organization}
                  type="string"
                  aria-label="organization"
                  disabled={true}
                  id="organizationoutput"
                />
                <DropwDown style={{ minWidth: 160 }} value={item.currencyCode} disabled={true} id="currenciesoutput">
                  {this.getMenuItems(currencies)}
                </DropwDown>
                <TextInput value={item.value} aria-label="amount" disabled={true} id="amountoutput" />
              </div>
            ))
          : null}
        <div style={styles.inputDiv}>
          {storeOrganization ? (
            <TextInput
              // TODO organization & helper
              label="Organization"
              helperText="e.g. 'MyOrganization'"
              value={organization}
              onChange={o => {
                storeOrganization(o);
              }}
              onBlur={e => storeOrganization(e.target.value)}
              onFocus={() => storeOrganization(organization)}
              type="string"
              aria-label="organization"
              disabled={disabled || editDialogShown}
              id="organizationinput"
            />
          ) : null}
          <DropwDown
            style={{ minWidth: 160 }}
            floatingLabel={currencyTitle}
            value={currency}
            onChange={storeCurrency}
            disabled={disabled || editDialogShown}
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
            disabled={disabled || editDialogShown}
            id="amountinput"
          />
        </div>
        {!editDialogShown ? (
          <Fab
            className={null}
            size="small"
            variant="round"
            aria-label="create"
            disabled={false}
            onClick={() => {
              addProjectedBudget({
                organization: organization,
                value: budget,
                currencyCode: currency
              });
            }}
            color="primary"
            data-test="create-project-button"
          >
            <ContentAdd />
          </Fab>
        ) : null}
      </div>
    );
  }
}
export default withStyles(styles)(Budget);
