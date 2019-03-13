import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import ListItemText from "@material-ui/core/ListItemText";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import Fab from "@material-ui/core/Fab";
import Divider from "@material-ui/core/Divider";

import moment from "moment";

import { intentMapping, newIntentMapping, parseURI, newParseURI, fetchResourceName, hasAccess } from "./helper";
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
            <Fab
              size="small"
              disabled={!hasAccess(resources)}
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

const NewNotificationListItems = ({
  classes,
  notifications,
  history,
  markNotificationAsRead,
  notificationsPerPage,
  notificationOffset
}) =>
  notifications.map((notification, index) => {
    const message = newIntentMapping(notification);
    const { businessEvent, id, isRead, projectId, subprojectId, workflowitemId } = notification;
    const createdAt = moment(businessEvent.time).fromNow();
    const redirectUri = newParseURI(notification);
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
          onClick={isRead ? undefined : () => markNotificationAsRead(id, notificationOffset, notificationsPerPage)}
        >
          <div className={isRead ? classes.read : classes.unread}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText className={classes.projectMetadata} component="div" primary={""} secondary={""} />

          <ListItemText
            data-test={`${testLabel}-message`}
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
              // TODO: hasAccess
              // disabled={!hasAccess()}
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

export default withStyles(styles)(NotificationListItems);
