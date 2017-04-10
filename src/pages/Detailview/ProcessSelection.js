import React from 'react';
import { fromJS } from 'immutable';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
var fieldValue;



const defaultState =  fromJS({
  fieldValue: 1
});

let state = defaultState



const ProcessSelection = () => (

  <div style={{
    width: '40%',
    left: '20%',
    position: 'relative',
    zIndex: 1100,

  }}>
    <SelectField
          floatingLabelText="Originating Step"
          onChange={handleChange}
          value = {state.get('fieldValue')}
          style = {{width: 300}}
          >
          <MenuItem value={1} primaryText="Defintion of purpose" />
          <MenuItem value={2} primaryText="Submission of financing agreement" />
          <MenuItem value={3} primaryText="Approval report tender evaluation" />
          <MenuItem value={4} primaryText="Invoice approval" />
        </SelectField>


  </div>
);
function  handleChange(event, index, value){


  state.set('fieldValue', value);
}

export default ProcessSelection;
