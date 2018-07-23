import React from "react";

import Badge from "@material-ui/core/Badge";
import BubbleIcon from "@material-ui/icons/ChatBubbleOutline";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";

import strings from "../../localizeStrings";

const styles = {
  badge: {
    top: "-2px",
    right: "-2px"
  }
};

const NotificationIcon = ({ unreadNotifications, history, classes }) => {
  if (typeof (unreadNotifications) === "number" && unreadNotifications > 0) {
    return (
      <Badge classes={classes} badgeContent={unreadNotifications} color="secondary">
        <IconButton tooltip={strings.navigation.unread_notifications} onClick={() => history.push("/notifications")}>
          <BubbleIcon color="primary" />
        </IconButton>
      </Badge>
    );
  }
  else {
    return (
      <IconButton tooltip={strings.navigation.unread_notifications} onClick={() => history.push("/notifications")}>
        <BubbleIcon color="primary" />
      </IconButton>
    );
  }

};

export default withStyles(styles)(NotificationIcon);
