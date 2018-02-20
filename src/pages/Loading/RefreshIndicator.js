import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import strings from '../../localizeStrings';

import {
  ACMECorpLightgreen
} from '../../colors'

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

const Refresh = (props) => (
  <div style={{
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
      <RefreshIndicator
        size={100}
        left={0}
        top={0}
        percentage={50}
        status="loading"
        style={style.refresh}
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

export default Refresh;
