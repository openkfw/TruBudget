import React from 'react';

import Snackbar from 'material-ui/Snackbar';
import ReactMaterialUiNotifications from 'react-materialui-notifications'

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
        notifications={props.notifications} />
    </div>
  )
}

export default LiveNotification;
