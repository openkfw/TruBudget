import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const Loading = (props) => (
  <div style={{
    display: 'flex',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2000
  }}>
    <CircularProgress size={80} thickness={5} />
  </div>
);

export default Loading;
