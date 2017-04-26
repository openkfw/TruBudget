import React from 'react';
import Snackbar from 'material-ui/Snackbar';

import FlyInNotifications from './FlyInNotifications';

const LiveNotification = (props) => {
  return (
    <div>
      <Snackbar
        open={props.showSnackBar}
        message={props.snackBarMessage}
        autoHideDuration={4000}
        onRequestClose={props.closeSnackBar}
      />
      <FlyInNotifications
        notifications={props.notifications}
        users={props.users} />
    </div>
  )
}

export default LiveNotification;
