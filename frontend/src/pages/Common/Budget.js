import React, { Component } from 'react';
import Dropdown from './Dropdown';
import TextInput from './TextInput';
import { getCurrencies, preselectCurrency, fromAmountString } from '../../helper';

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
}

class Budget extends Component {

  componentWillMount() {
    preselectCurrency(this.props.parentCurrency, this.props.storeCurrency);
  }

  render() {
    const { parentCurrency, currencyTitle, currency, storeCurrency, budgetLabel, budgetHintText, budget, storeBudget, budgetDisabled } = this.props;
    const currencies = getCurrencies(parentCurrency);
    console.log()
    return (
      <div style={styles.inputDiv}>
        <Dropdown
          title={currencyTitle}
          value={currency}
          onChange={storeCurrency}
          items={currencies}
          disabled={budgetDisabled}
        />
        <TextInput
          floatingLabelText={budgetLabel}
          hintText={budgetHintText}
          value={budget}
          onChange={(v) => { if (/^[0-9,.-]*$/.test(v)) storeBudget(v) }}
          onBlur={(e) => storeBudget(fromAmountString(e.target.value))}
          type='number'
          aria-label='amount'
          disabled={budgetDisabled}
        />
      </div>
    )
  }
}
export default Budget;
