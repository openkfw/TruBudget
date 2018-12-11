import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import ListItemText from "@material-ui/core/ListItemText";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";

import moment from "moment";

import { intentMapping, parseURI, fetchResourceName, hasAccess } from "./helper";
import { withStyles } from "@material-ui/core";

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
}) =>
  notifications.map((notification, index) => {
    const message = intentMapping(notification);
    const { originalEvent, notificationId, isRead, resources } = notification;
    const createdAt = moment(originalEvent.createdAt).fromNow();
    const redirectUri = parseURI(notification);
    const testLabel = `notification-${isRead ? "read" : "unread"}-${index}`;
    return (
      <div key={index}>
        <Divider />
        <ListItem
          component="div"
          className={classes.row}
          key={index}
          button={isRead ? false : true}
          data-test={testLabel}
          onClick={
            isRead ? undefined : () => markNotificationAsRead(notificationId, notificationOffset, notificationsPerPage)
          }
        >
          <div className={isRead ? classes.read : classes.unread}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            className={classes.projectMetadata}
            component="div"
            primary={fetchResourceName(resources, "project")}
            secondary={fetchResourceName(resources, "subproject")}
          />

          <ListItemText
            data-test={`${testLabel}-message`}
            className={classes.title}
            component="div"
            primary={message}
          />
          <ListItemText
            className={classes.author}
            component="div"
            primary={originalEvent.createdBy}
            secondary={createdAt}
          />
          <div className={classes.button}>
            <Button
              mini
              disabled={!hasAccess(resources)}
              color="primary"
              variant="fab"
              onClick={() => history.push(redirectUri)}
            >
              <LaunchIcon />
            </Button>
          </div>
        </ListItem>
      </div>
    );
  });

export default withStyles(styles)(NotificationListItems);
