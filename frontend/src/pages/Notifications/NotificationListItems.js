import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import Fab from "@material-ui/core/Fab";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import dayjs from "dayjs";
import React from "react";

import { intentMapping, parseURI, isAllowedToSee } from "./helper";

const styles = theme => ({
  row: {
    display: "flex",
    flex: 1
  },
  projectMetadata: {
    flex: 3
  },
  title: {
    flex: 5
  },
  author: {
    flex: 2
  },
  button: {
    flex: 1,
    display: "flex",
    justifyContent: "center"
  },
  read: {
    flex: 1,
    opacity: 0.3
  },
  unread: {
    flex: 1,
    opacity: 1
  }
});

const NotificationListItems = ({
  classes,
  notifications,
  history,
  markNotificationAsRead,
  notificationsPerPage,
  notificationOffset
}) => {
  notifications.reverse();
  return notifications.map((notification, index) => {
    const message = intentMapping(notification);
    const { businessEvent, id, isRead, metadata } = notification;
    const createdAt = dayjs(businessEvent.time).fromNow();
    const redirectUri = parseURI({
      projectId: metadata.project ? metadata.project.id : undefined,
      subprojectId: metadata.subproject ? metadata.subproject.id : undefined
    });
    const testLabel = `notification-${isRead ? "read" : "unread"}`;
    return (
      <div key={index}>
        <Divider />
        <ListItem
          component="div"
          className={classes.row}
          key={index}
          button={isRead ? false : true}
          data-test={testLabel}
          onClick={isRead ? undefined : () => markNotificationAsRead(id, notificationOffset, notificationsPerPage)}
        >
          <div className={isRead ? classes.read : classes.unread}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText className={classes.projectMetadata} component="div" primary={""} secondary={""} />

          <ListItemText
            data-test={`${testLabel}-${index}`}
            className={classes.title}
            component="div"
            primary={message}
          />
          <ListItemText
            className={classes.author}
            component="div"
            primary={businessEvent.publisher}
            secondary={createdAt}
          />
          <div className={classes.button}>
            <Fab
              size="small"
              disabled={!isAllowedToSee(notification)}
              color="primary"
              onClick={() => history.push(redirectUri)}
            >
              <LaunchIcon />
            </Fab>
          </div>
        </ListItem>
      </div>
    );
  });
};

export default withStyles(styles)(NotificationListItems);
