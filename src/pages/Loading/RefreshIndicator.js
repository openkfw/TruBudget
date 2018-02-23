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
  },
};

const Refresh = (props) => (
  <div style={{
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 2000,
    filter: 'blur(0)'
  }}>
    <div style={{
      display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center',
      justifyContent: 'center'
    }}>
      <RefreshIndicator
        size={50}
        left={0}
        top={0}
        percentage={50}
        status="loading"
        loadingColor={ACMECorpLightgreen}
        style={style.refresh}
      />
    </div>
  </div>
);

export default Refresh;
