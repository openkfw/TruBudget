import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import dayjs from "dayjs";
import React from "react";
import classNames from "classnames";
import { intentMapping, parseURI, getParentData, isAllowedToSee } from "./helper";
import { dateFormat } from "../../helper";
import strings from "../../localizeStrings";

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
  },
  unreadMessage: {
    backgroundColor: theme.palette.grey.main
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
    const createdAt = dayjs(businessEvent.time).format(dateFormat());
    const redirectUri = parseURI({
      projectId: metadata.project ? metadata.project.id : undefined,
      subprojectId: metadata.subproject ? metadata.subproject.id : undefined
    });
    const testLabel = `notification-${isRead ? "read" : "unread"}`;
    const dateTestLabel = "dateOfNotification";
    const { projectDisplayName, subprojectDisplayName } = getParentData(notification);
    return (
      <div key={index}>
        <Divider />
        <ListItem
          component="div"
          className={classNames(classes.row, !isRead ? classes.unreadMessage : false)}
          key={index}
          button={isRead ? false : true}
          data-test={testLabel}
          onClick={isRead ? undefined : () => markNotificationAsRead(id, notificationOffset, notificationsPerPage)}
        >
          <div className={isRead ? classes.read : classes.unread}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            className={classes.projectMetadata}
            component="div"
            primary={projectDisplayName}
            secondary={subprojectDisplayName}
          />
          <ListItemText
            data-test={`${testLabel}-${index}`}
            className={classes.title}
            component="div"
            primary={message}
          />
          <ListItemText
            data-test={`${dateTestLabel}-${index}`}
            className={classes.author}
            component="div"
            primary={businessEvent.publisher}
            secondary={createdAt}
          />
          <div className={classes.button}>
            {isAllowedToSee(notification) ? (
              <Tooltip id="tooltip-inspect" title={strings.common.view}>
                <div>
                  <IconButton onClick={() => history.push(redirectUri)}>
                    <LaunchIcon />
                  </IconButton>
                </div>
              </Tooltip>
            ) : null}
          </div>
        </ListItem>
      </div>
    );
  });
};

export default withStyles(styles)(NotificationListItems);
