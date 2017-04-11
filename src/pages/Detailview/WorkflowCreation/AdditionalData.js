import React from 'react';


import TextField from 'material-ui/TextField';

const AdditionalData = () => (
  <div style={{
    width: '40%',
    left: '20%',
    position: 'relative',
    zIndex: 1100,

  }}>
    <TextField
      hintText="e.g. amount"
      floatingLabelText="Additional Data"/>
  </div>
);

export default AdditionalData;
