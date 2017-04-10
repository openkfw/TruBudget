import React from 'react';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
const OriginatingStep = () => (
  <div style={{
    width: '40%',
    left: '20%',
    position: 'relative',
    zIndex: 1100,

  }}>
    <SelectField
          floatingLabelText="Originating Step"
        >
          <MenuItem value={1} primaryText="First Step" />
          <MenuItem value={2} primaryText="Other" />
        </SelectField>


  </div>
);

export default OriginatingStep;
