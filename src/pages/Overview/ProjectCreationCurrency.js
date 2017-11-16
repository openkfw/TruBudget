import React, { Component } from 'react';
import _ from 'lodash'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import strings from '../../localizeStrings'
class ProjectCreationCurrency extends Component {

  componentWillMount() {
    const preSelectedCurrency = _.isUndefined(this.props.parentCurrency) ? 'EUR' : this.props.parentCurrency
    this.setCurrency(preSelectedCurrency)
  }

  handleChange = (event, index, value) => {
    switch (value) {
      case 'EUR':
        this.setCurrency('EUR');
        break;
      case 'USD':
        this.setCurrency('USD')
        break;
      case 'BRL':
        this.setCurrency('BRL')
        break;
      default:
        this.setCurrency('EUR');
        break;
    }

  }

  setCurrency = (currency) => {
    this.props.storeProjectCurrency(currency)
  }

  render() {
    const parentCurrency = this.props.parentCurrency
    let usdDisabled;
    let eurDisabled;
    let brlDisabled;
    if (_.isUndefined(parentCurrency)) {
      usdDisabled = false;
      eurDisabled = false;
      brlDisabled = false;
    } else {
      usdDisabled = !(parentCurrency === 'USD');
      eurDisabled = !(parentCurrency === 'EUR');
      brlDisabled = !(parentCurrency === 'BRL');
    }
    return (
      <SelectField style={{
        width: '27%',
        top: '15px',
        left: '5px',
        position: 'relative'
      }}
        floatingLabelText={strings.project.project_currency}
        value={this.props.projectCurrency}
        onChange={this.handleChange}
      >
        <MenuItem disabled={eurDisabled} value='EUR' primaryText="EUR" />
        <MenuItem disabled={usdDisabled} value='USD' primaryText="USD" />
        <MenuItem disabled={brlDisabled} value='BRL' primaryText="BRL" />
      </SelectField>
    );
  }
}
export default ProjectCreationCurrency;
