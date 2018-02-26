import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import {
  ACMECorpLightgreen
} from '../../colors'

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '40vh',
    width: '100%',
    height: '100%',
    zIndex: 2000,
  },
  refreshContainer: {
    display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'top',
    justifyContent: 'center'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
};

const Refresh = (props) => (
  <div style={styles.container}>
    <div style={styles.refreshContainer}>
      <RefreshIndicator
        size={50}
        left={0}
        top={0}
        percentage={50}
        status="loading"
        loadingColor={ACMECorpLightgreen}
        style={styles.refresh}
      />
    </div>
  </div>
);

export default Refresh;
