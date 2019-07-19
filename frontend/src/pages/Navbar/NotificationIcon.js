import React from "react";

import Badge from "@material-ui/core/Badge";
import BubbleIcon from "@material-ui/icons/ChatBubbleOutline";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import strings from "../../localizeStrings";

const styles = {
  badge: {
    top: "8px",
    right: "8px",
    width: "25px",
    height: "25px"
  },
  white: {
    color: "white"
  }
};

const NotificationIcon = ({ unreadNotificationCount, history, classes }) => {
  if (typeof unreadNotificationCount === "number" && unreadNotificationCount > 0) {
    const maxNotificationCount = 50;
    const unread =
      unreadNotificationCount > maxNotificationCount ? `${maxNotificationCount}+` : unreadNotificationCount;
    return (
      <Badge
        classes={{ badge: classes.badge }}
        badgeContent={
          <Typography className={classes.white} variant="caption">
            {unread}
          </Typography>
        }
        color="secondary"
      >
        <IconButton
          data-test="navbar-notification-button"
          tooltip={strings.navigation.unread_notifications}
          onClick={() => history.push("/notifications")}
        >
          <BubbleIcon color="primary" />
        </IconButton>
      </Badge>
    );
  } else {
    return (
      <IconButton
        data-test="navbar-notification-button"
        tooltip={strings.navigation.unread_notifications}
        onClick={() => history.push("/notifications")}
      >
        <BubbleIcon color="primary" />
      </IconButton>
    );
  }
};

export default withStyles(styles)(NotificationIcon);
