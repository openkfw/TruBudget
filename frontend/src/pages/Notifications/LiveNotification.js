import React from "react";
import NotificationsSnackbar from "./NotificationsSnackbar";

const LiveNotification = props => {
  return (
    <div>
      <NotificationsSnackbar {...props} />
    </div>
  );
};

export default LiveNotification;
