import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import strings from '../../localizeStrings';

import {
  ACMECorpLightgreen
} from '../../colors'

const Loading = (props) => (
  <div style={{
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2000
  }}>
    <div style={{
      display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center',
      justifyContent: 'center'
    }}>
      <CircularProgress
        mode="determinate"
        value={props.completed}
        size={80}
        thickness={8}
      />
    </div>
    <div style={{
      display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center',
      justifyContent: 'center', marginTop: '30px'
    }}>
      <span style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '30px', color: ACMECorpLightgreen }}>
        {strings.login.loading}
      </span>
    </div>
  </div>
);


export default Loading;
