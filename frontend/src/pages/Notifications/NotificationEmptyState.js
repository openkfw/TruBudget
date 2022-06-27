import React from "react";
import Typography from "@mui/material/Typography";
import strings from "../../localizeStrings";

const styles = {
  subtitle: {
    color: theme => theme.palette.grey.dark
  },
  caption: {
    color: theme => theme.palette.grey.main
  }
};

const NotificationEmptyState = props => {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="images-for-empty-state/notification-empty-state.png"
        alt={strings.common.no_notifications}
        width="505vw"
      />
      <Typography variant="body1" style={styles.caption}>
        {strings.common.no_notifications}
      </Typography>
    </div>
  );
};

export default NotificationEmptyState;
