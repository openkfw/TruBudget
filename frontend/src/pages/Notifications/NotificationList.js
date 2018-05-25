import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import NotificationsNone from "@material-ui/icons/NotificationsNone";
import LaunchIcon from "@material-ui/icons/Launch";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { tsToString } from "../../helper";
import moment from "moment";
import { Typography } from "@material-ui/core";

const styles = {
  root: {
    width: "100%",
    backgroundColor: "white"
  },
  tsText: {
    display: "flex",
    justifyContent: "flex-end",
    marginRight: "40px"
  },
  viewButton: {
    marginRight: "20px"
  },
  notRead: {
    fontWeight: "bold"
  }
};

const intentMapping = ({ originalEvent, resources }) => {
  switch (originalEvent.intent) {
    case "subproject.assign":
      const subproject = resources.find(resource => resource.type === "subproject");
      return { secondaryText: `Subproject ${subproject.displayName} was assigned to you`, primaryText: "Assignment" };
    case "workflowitem.assign":
      const workflowitem = resources.find(resource => resource.type === "workflowitem");
      return {
        secondaryText: `Workflowitem ${workflowitem.displayName} was assigned to you`,
        primaryText: "Assignment"
      };
    case "project.assign":
      const project = resources.find(resource => resource.type === "project");
      return {
        secondaryText: `Project ${project.displayName} was assigned to you`,
        primaryText: "Assignment"
      };
    default:
      return "Intent not found";
  }
};

const parseURI = ({ resources }) => {
  const project = resources.find(resource => resource.type === "project");
  const subproject = resources.find(resource => resource.type === "subproject");
  if (subproject) {
    return `/projects/${project.id}/${subproject.id}`;
  } else {
    return `/projects/${project.id}`;
  }
};

const getListItems = ({ notifications, history, markNotificationAsRead }) =>
  notifications.map((notification, index) => {
    const { primaryText, secondaryText } = intentMapping(notification);
    const createdAt = moment(notification.originalEvent.createdAt).fromNow();
    const redirectUri = parseURI(notification);
    return (
      <div key={index}>
        <Divider />
        <ListItem
          key={index}
          button={notification.isRead ? false : true}
          onClick={notification.isRead ? undefined : () => markNotificationAsRead(notification.notificationId)}
        >
          <ListItemIcon>
            <NotificationsNone />
          </ListItemIcon>
          <ListItemText
            primary={<Typography style={notification.isRead ? null : styles.notRead}> {primaryText}</Typography>}
            secondary={<Typography style={notification.isRead ? {} : styles.notRead}> {secondaryText}</Typography>}
          />
          <ListItemText
            style={styles.tsText}
            secondary={<Typography style={notification.isRead ? null : styles.notRead}> {createdAt}</Typography>}
          />
          <ListItemSecondaryAction style={styles.viewButton}>
            <Button mini color="primary" variant="fab" onClick={() => history.push(redirectUri)}>
              <LaunchIcon />
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  });

const NotificationsList = props => {
  const listItems = getListItems(props);
  return (
    <div style={styles.root}>
      <List
        subheader={
          <ListSubheader>
            <h1>Notifications</h1>
          </ListSubheader>
        }
      >
        {listItems}
      </List>
    </div>
  );
};

export default NotificationsList;
