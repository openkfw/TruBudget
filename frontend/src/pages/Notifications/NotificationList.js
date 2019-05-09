import React from "react";

import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import { withStyles } from "@material-ui/core/styles";
import TablePagination from "@material-ui/core/TablePagination";

import strings from "../../localizeStrings";
import NotificationListItems from "./NotificationListItems";

const styles = {
  button: {
    marginTop: 20,
    marginRight: 30
  },
  paginationDiv: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end"
  }
};

const markPageAsRead = (markMultipleNotificationsAsRead, notifications, notificationOffset, notificationsPerPage) => {
  const notificationIds = notifications.map(notification => notification.id);
  markMultipleNotificationsAsRead(notificationIds, notificationOffset, notificationsPerPage);
};

const onChangeRowsPerPage = (
  event,
  setNotifcationsPerPage,
  notificationOffset,
  fetchNotifications,
  setNotificationOffset
) => {
  let offset = notificationOffset;
  if (offset < event.target.value) {
    offset = 0;
  } else if (offset % event.target.value > 0) {
    offset = offset - offset % event.target.value;
  }
  setNotifcationsPerPage(event.target.value);
  fetchNotifications(offset, event.target.value);
  setNotificationOffset(offset);
};

const onChangePage = (
  nextPage,
  currentPage,
  notificationOffset,
  notificationsPerPage,
  fetchNotifications,
  setNotificationOffset
) => {
  if (nextPage > currentPage) {
    //Moving forward
    let offset = 0;
    if (nextPage > 0) {
      offset = notificationOffset + notificationsPerPage;
    }
    fetchNotifications(offset, notificationsPerPage);
    setNotificationOffset(offset);
  } else {
    //moving backward
    let offset = 0;
    if (nextPage > 0) {
      offset = notificationOffset - notificationsPerPage;
    }
    fetchNotifications(offset, notificationsPerPage);
    setNotificationOffset(offset);
  }
};

const NotificationsList = props => {
  const {
    classes,
    markMultipleNotificationsAsRead,
    notifications,
    setNotifcationsPerPage,
    notificationsPerPage,
    fetchNotifications,
    notificationCount,
    notificationOffset,
    setNotificationOffset,
    history,
    markNotificationAsRead
  } = props;
  const allNotificationsRead = notifications.some(notification => notification.isRead === false);
  const rowsPerPageOptions = [5, 10, 20, 50];
  const currentPage = Math.floor(notificationOffset / notificationsPerPage);
  return (
    <Card>
      <CardHeader
        title="Notifications"
        action={
          <Button
            variant="outlined"
            onClick={() =>
              markPageAsRead(markMultipleNotificationsAsRead, notifications, notificationOffset, notificationsPerPage)
            }
            color="primary"
            className={classes.button + " mark-all-notifications-as-read"}
            data-test="read-multiple-notifications"
            disabled={!allNotificationsRead}
          >
            {strings.notification.read_all}
          </Button>
        }
      />
      <List component="div" data-test="notification-list">
        <NotificationListItems
          notifications={notifications}
          history={history}
          markNotificationAsRead={markNotificationAsRead}
          notificationsPerPage={notificationsPerPage}
          notificationOffset={notificationOffset}
        />
      </List>
      <div className={classes.paginationDiv}>
        <TablePagination
          component="div"
          rowsPerPageOptions={rowsPerPageOptions}
          rowsPerPage={notificationsPerPage}
          onChangeRowsPerPage={event =>
            onChangeRowsPerPage(
              event,
              setNotifcationsPerPage,
              notificationOffset,
              fetchNotifications,
              setNotificationOffset
            )
          }
          count={notificationCount}
          page={currentPage}
          onChangePage={(_, nextPage) =>
            onChangePage(
              nextPage,
              currentPage,
              notificationOffset,
              notificationsPerPage,
              fetchNotifications,
              setNotificationOffset
            )
          }
        />
      </div>
    </Card>
  );
};

export default withStyles(styles)(NotificationsList);
