import React from "react";
import Badge from "@mui/material/Badge";
import BubbleIcon from "@mui/icons-material/ChatBubbleOutline";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
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

const NotificationIcon = ({ unreadNotificationCount, history }) => {
  if (typeof unreadNotificationCount === "number" && unreadNotificationCount > 0) {
    const maxNotificationCount = 50;
    const unread =
      unreadNotificationCount > maxNotificationCount ? `${maxNotificationCount}+` : unreadNotificationCount;
    return (
      <Badge
        sx={{ badge: styles.badge }}
        badgeContent={
          <Typography sx={styles.white} variant="caption">
            {unread}
          </Typography>
        }
        color="secondary"
      >
        <IconButton
          data-test="navbar-notification-button"
          tooltip={strings.navigation.unread_notifications}
          onClick={() => history.push("/notifications")}
          size="large"
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
        size="large"
      >
        <BubbleIcon color="primary" />
      </IconButton>
    );
  }
};

export default NotificationIcon;
