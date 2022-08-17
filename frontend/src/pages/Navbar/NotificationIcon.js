import React from "react";
import Badge from "@mui/material/Badge";
import BubbleIcon from "@mui/icons-material/ChatBubbleOutline";
import IconButton from "@mui/material/IconButton";
import strings from "../../localizeStrings";

const NotificationIcon = ({ unreadNotificationCount, history }) => {
  const hasNotifications = typeof unreadNotificationCount === "number" && unreadNotificationCount > 0;
  const maxNotificationCount = 50;
  let unreadCountShown = 0;
  if (hasNotifications) {
    unreadCountShown =
      unreadNotificationCount > maxNotificationCount ? `${maxNotificationCount}+` : unreadNotificationCount;
  }
  return (
    <Badge
      sx={{ "& .MuiBadge-badge": { top: "10px", right: "5px" } }}
      badgeContent={unreadCountShown}
      color="secondary"
      invisible={!hasNotifications}
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
};

export default NotificationIcon;
