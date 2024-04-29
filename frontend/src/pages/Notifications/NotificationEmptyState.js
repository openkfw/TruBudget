import React from "react";

import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

const NotificationEmptyState = () => {
  return (
    <div className="empty-state-table">
      <img
        src="images-for-empty-state/notification-empty-state.png"
        alt={strings.common.no_notifications}
        width="505vw"
      />
      <Typography variant="body1" className="caption">
        {strings.common.no_notifications}
      </Typography>
    </div>
  );
};

export default NotificationEmptyState;
