import React from "react";
import IconButton from "material-ui/IconButton";
import BubbleIcon from "@material-ui/icons/ChatBubbleOutline";

import Badge from "material-ui/Badge";

import colors from "../../colors";
import strings from "../../localizeStrings";
import { withStyles } from "material-ui/styles";

const styles = {
  badge: {
    top: "-2px",
    right: "-2px"
  }
};

const NotificationIcon = ({ unreadNotifications, history, classes }) => {
  return (
    <Badge classes={classes} badgeContent={unreadNotifications} color="secondary">
      <IconButton tooltip={strings.navigation.unread_notifications} onClick={() => history.push("/notifications")}>
        <BubbleIcon color="primary" />
      </IconButton>
    </Badge>
  );
};

export default withStyles(styles)(NotificationIcon);
