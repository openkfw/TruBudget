import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Unread from "@material-ui/icons/Email";
import Read from "@material-ui/icons/MailOutline";
import ListItemText from "@material-ui/core/ListItemText";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import { withStyles } from "@material-ui/core/styles";
import TablePagination from "@material-ui/core/TablePagination";

import moment from "moment";

import { intentMapping, parseURI, fetchResourceName, hasAccess } from "./helper";
import strings from "../../localizeStrings";

const styles = theme => ({
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
  },
  button: {
    marginTop: 20,
    marginRight: 30
  }
});

const getListItems = (
  notifications,
  history,
  markNotificationAsRead,
  lastFetchedBeforeId,
  lastFetchedAfterId,
  notificationsPerPage
) =>
  notifications.map((notification, index) => {
    const message = intentMapping(notification);
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
          onClick={
            isRead
              ? undefined
              : () =>
                  markNotificationAsRead(notificationId, lastFetchedBeforeId, lastFetchedAfterId, notificationsPerPage)
          }
        >
          <div style={{ flex: 1, opacity: isRead ? 0.3 : 1 }}>
            <ListItemIcon>{isRead ? <Read /> : <Unread />}</ListItemIcon>
          </div>
          <ListItemText
            style={{ flex: 3 }}
            component="div"
            primary={fetchResourceName(resources, "project")}
            secondary={fetchResourceName(resources, "subproject")}
          />

          <ListItemText style={{ flex: 5 }} component="div" primary={message} />
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

const handleClick = (
  markAllNotificationAsRead,
  notifications,
  lastFetchedBeforeId,
  lastFetchedAfterId,
  notificationsPerPage
) => {
  const notificationIds = notifications.map(notification => notification.notificationId);
  markAllNotificationAsRead(notificationIds, lastFetchedBeforeId, lastFetchedAfterId, notificationsPerPage);
};

const NotificationsList = props => {
  const {
    classes,
    markAllNotificationAsRead,
    notifications,
    setNotifcationsPerPage,
    notificationsPerPage,
    fetchNotifications,
    notificationPage,
    setNotificationPage,
    notificationCount,
    setLastFetchedBeforeId,
    setLastFetchedAfterId,
    lastFetchedBeforeId,
    lastFetchedAfterId,
    history,
    markNotificationAsRead
  } = props;
  const listItems = getListItems(
    notifications,
    history,
    markNotificationAsRead,
    lastFetchedBeforeId,
    lastFetchedAfterId,
    notificationsPerPage
  );
  const allNotificationsRead = notifications.some(notification => notification.isRead === false);
  const rowsPerPageOptions = [5, 10, 20, 50];
  return (
    <Card>
      <CardHeader
        title="Notifications"
        action={
          <Button
            variant="outlined"
            onClick={() =>
              handleClick(
                markAllNotificationAsRead,
                notifications,
                lastFetchedBeforeId,
                lastFetchedAfterId,
                notificationsPerPage
              )
            }
            color="primary"
            className={classes.button}
            disabled={!allNotificationsRead}
          >
            {strings.notification.read_all}
          </Button>
        }
      />
      <List component="div">{listItems}</List>
      <div style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          rowsPerPage={notificationsPerPage}
          onChangeRowsPerPage={event => {
            setNotifcationsPerPage(event.target.value);
            fetchNotifications("", "", "", event.target.value);
          }}
          count={notificationCount}
          page={notificationPage}
          onChangePage={(_, page) => {
            if (page > notificationPage) {
              const afterId = notifications[notifications.length - 1].notificationId;
              setLastFetchedAfterId(afterId);
              setNotificationPage(page);
              fetchNotifications("", afterId, notificationsPerPage);
            } else {
              const beforeId = notifications[0].notificationId;
              setLastFetchedBeforeId(beforeId);
              setNotificationPage(page);
              fetchNotifications(beforeId, "", notificationsPerPage);
            }
          }}
        />
      </div>
    </Card>
  );
};

export default withStyles(styles)(NotificationsList);
