import React, { Component } from 'react';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class ProjectCreationCurrency extends Component {

  state = {
    value: 1,
  };

  handleChange = (event, index, value) => {
    switch (value) {
      case 1:
        this.props.storeProjectCurrency('EUR');
        break;
      case 2:
        this.props.storeProjectCurrency('USD')
        break;
      default:
        this.props.storeProjectCurrency('EUR');
        break;
    }

     this.setState({value});
   }


  render() {
    return(
            <SelectField style={{
              width: '25%',
              top: '15px',
              left: '5px',
              position: 'relative'
            }}
              floatingLabelText="Currency"
             value={this.props.projectCurrency}
             onChange={this.handleChange}
           >
             <MenuItem value='EUR' primaryText="EUR" />
             <MenuItem value='USD' primaryText="USD" />
             </SelectField>
       );
}
}
export default ProjectCreationCurrency;
