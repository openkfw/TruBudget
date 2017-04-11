import React from 'react';


import TextField from 'material-ui/TextField';

const Origin = () => (
  <div style={{
    width: '40%',
    left: '20%',
    position: 'relative',
    zIndex: 1100,

  }}>
    <TextField
      hintText="e.g. your name or your institute"
      floatingLabelText="Origin"/>
  </div>
);

export default Origin;
