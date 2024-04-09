import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import Unread from "@mui/icons-material/Email";
import Read from "@mui/icons-material/MailOutline";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";

import { getParentData, intentMapping, isAllowedToSee, parseURI } from "./helper";

import "./NotificationListItems.scss";

const NotificationListItems = ({ notifications, markNotificationAsRead, notificationsPerPage, notificationOffset }) => {
  const navigate = useNavigate();
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
          className={isRead ? "notification-row" : "notification-row unread-message"}
          key={index}
          button={isRead ? false : true}
          data-test={testLabel}
          onClick={isRead ? undefined : () => markNotificationAsRead(id, notificationOffset, notificationsPerPage)}
        >
          <div className={isRead ? "read" : "unread"}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            className="project-meta-data"
            component="div"
            primary={projectDisplayName}
            secondary={subprojectDisplayName}
          />
          <ListItemText
            data-test={`${testLabel}-${index}`}
            className="notification-title"
            component="div"
            primary={message}
          />
          <ListItemText
            data-test={`${dateTestLabel}-${index}`}
            className="notification-author"
            component="div"
            primary={businessEvent.publisher}
            secondary={createdAt}
          />
          <div className="view-button-container">
            {isAllowedToSee(notification) ? (
              <Tooltip id="tooltip-inspect" title={strings.common.view}>
                <div>
                  <IconButton aria-label="launch" onClick={() => navigate(redirectUri)} size="large">
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
