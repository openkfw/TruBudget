import React, { Component } from 'react';
import Dropdown from './Dropdown';
import TextInput from './TextInput';
import { getCurrencies, preselectCurrency } from '../../helper';

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

class ProjectAmount extends Component {

  componentWillMount() {
    preselectCurrency(this.props.parentCurrency, this.props.storeCurrency);
  }

  render() {
    const { parentCurrency, currencyTitle, currency, storeCurrency, budgetLabel, budgetHintText, budget, storeBudget } = this.props;
    const currencies = getCurrencies(parentCurrency);

    return (
      <div style={styles.inputDiv}>
        <Dropdown
          title={currencyTitle}
          value={currency}
          onChange={storeCurrency}
          items={currencies}
        />
        <TextInput
          floatingLabelText={budgetLabel}
          hintText={budgetHintText}
          value={budget}
          onChange={storeBudget}
          type='number'
          aria-label='amount'
        />
      </div>
    )
  }
}
export default ProjectAmount;
