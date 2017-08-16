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
    const usdDisabled = parentCurrency === 'USD' ? true : false;
    const eurDisabled = parentCurrency === 'EUR' ? true : false;

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
        <MenuItem disabled={usdDisabled} value='EUR' primaryText="EUR" />
        <MenuItem disabled={eurDisabled} value='USD' primaryText="USD" />
      </SelectField>
    );
  }
}
export default ProjectCreationCurrency;
