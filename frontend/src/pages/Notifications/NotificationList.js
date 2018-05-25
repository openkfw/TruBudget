import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import ListItemText from "@material-ui/core/ListItemText";
import LaunchIcon from "@material-ui/icons/Launch";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";

import moment from "moment";

const styles = {
  root: {
    width: "100%",
    backgroundColor: "white"
  },
  tsText: {},
  viewButton: {
    marginRight: "20px"
  },
  notRead: {
    fontWeight: "bold"
  },
  row: {
    display: "flex",
    flex: 1
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

const fetchRessourceName = (res, type) => {
  const r = res.find(v => v.type === type);
  if (r !== undefined) {
    return r.displayName || "Redacted";
  } else {
    return "-";
  }
};

const hasAccess = res => res.reduce((acc, r) => acc && r.displayName !== undefined, true);

const getListItems = ({ notifications, history, markNotificationAsRead }) =>
  notifications.map((notification, index) => {
    console.log(notification);
    const { primaryText, secondaryText } = intentMapping(notification);
    const { originalEvent, notificationId, isRead, resources } = notification;
    const createdAt = moment(originalEvent.createdAt).fromNow();
    const redirectUri = parseURI(notification);
    return (
      <div key={index}>
        <Divider />
        <ListItem
          component="div"
          style={styles.row}
          key={index}
          button={isRead ? false : true}
          onClick={isRead ? undefined : () => markNotificationAsRead(notificationId)}
        >
          <div style={{ flex: 1, opacity: isRead ? 0.3 : 1 }}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            style={{ flex: 3 }}
            component="div"
            primary={fetchRessourceName(resources, "project")}
            secondary={fetchRessourceName(resources, "subproject")}
          />

          <ListItemText style={{ flex: 5 }} component="div" primary={secondaryText} />
          <ListItemText style={{ flex: 2 }} component="div" primary={originalEvent.createdBy} secondary={createdAt} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
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

const NotificationsList = props => {
  const listItems = getListItems(props);
  return (
    <Card>
      <CardHeader title="Notifications" />
      <List component="div">{listItems}</List>
    </Card>
  );
};

export default NotificationsList;
