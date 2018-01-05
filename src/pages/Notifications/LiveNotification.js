import React from 'react';


import FlyInNotifications from './FlyInNotifications';
import NotificationsSnackbar from './NotificationsSnackbar';

const LiveNotification = (props) => {

  return (
    <div>
      <NotificationsSnackbar {...props} />
      <FlyInNotifications notifications={ props.notifications } users={ props.users } />
    </div>
  )
}

export default LiveNotification;
