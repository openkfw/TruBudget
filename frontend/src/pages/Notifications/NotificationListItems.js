import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Unread from "@mui/icons-material/Email";
import Read from "@mui/icons-material/MailOutline";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import dayjs from "dayjs";
import React from "react";
import { intentMapping, parseURI, getParentData, isAllowedToSee } from "./helper";
import strings from "../../localizeStrings";

const styles = {
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
    backgroundColor: theme => theme.palette.grey.light
  }
};

const NotificationListItems = ({
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
    const createdAt = dayjs(businessEvent.time).format(strings.format.dateFormat);
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
          sx={!isRead ? `${styles.row} ${styles.unreadMessage}` : `${styles.row}`}
          key={index}
          button={isRead ? false : true}
          data-test={testLabel}
          onClick={isRead ? undefined : () => markNotificationAsRead(id, notificationOffset, notificationsPerPage)}
        >
          <div style={isRead ? styles.read : styles.unread}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            style={styles.projectMetadata}
            component="div"
            primary={projectDisplayName}
            secondary={subprojectDisplayName}
          />
          <ListItemText data-test={`${testLabel}-${index}`} style={styles.title} component="div" primary={message} />
          <ListItemText
            data-test={`${dateTestLabel}-${index}`}
            style={styles.author}
            component="div"
            primary={businessEvent.publisher}
            secondary={createdAt}
          />
          <div style={styles.button}>
            {isAllowedToSee(notification) ? (
              <Tooltip id="tooltip-inspect" title={strings.common.view}>
                <div>
                  <IconButton onClick={() => history.push(redirectUri)} size="large">
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

export default NotificationListItems;
