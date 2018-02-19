import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';

const style = {
  container: {
    display: 'flex',
    flex: '1',
    width: '100%',
    height: '500px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none'
  },
};

const Refresh = () => (
  <div style={style.container}>
    <RefreshIndicator
      size={100}
      left={0}
      top={0}
      percentage={50}
      status="loading"
      style={style.refresh}
    />
  </div>
);

export default Refresh;
