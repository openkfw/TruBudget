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

const markPageAsRead = (markMultipleNotificationsAsRead, notifications, notificationPage) => {
  const notificationIds = notifications.map(notification => notification.id);
  markMultipleNotificationsAsRead(notificationIds, notificationPage);
};

const onChangeRowsPerPage = (
  newNotificationsPerPage,
  setNotifcationsPerPage,
  fetchNotifications,
  currentPage,
  notificationsPerPage
) => {
  setNotifcationsPerPage(newNotificationsPerPage);
  //Fetch first page again
  fetchNotifications(0);
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
    history,
    markNotificationAsRead,
    currentPage
  } = props;
  const allNotificationsRead = notifications.some(notification => notification.isRead === false);
  const rowsPerPageOptions = [5, 10, 20, 50];
  return (
    <Card>
      <CardHeader title="Notifications" action={null} />
      <div style={{ display: "flex", verticalAlign: "middle", padding: "11px 16px" }}>
        <Button
          variant="outlined"
          onClick={() => markPageAsRead(markMultipleNotificationsAsRead, notifications, currentPage)}
          className={classes.button + " mark-all-notifications-as-read"}
          data-test="read-multiple-notifications"
          disabled={!allNotificationsRead}
          style={{ margin: "0px" }}
        >
          {strings.notification.read_all}
        </Button>
      </div>

      <List component="div" data-test="notification-list">
        <NotificationListItems
          notifications={notifications}
          history={history}
          markNotificationAsRead={notificationId => markNotificationAsRead(notificationId, currentPage)}
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
              event.target.value,
              setNotifcationsPerPage,
              fetchNotifications,
              currentPage,
              notificationsPerPage
            )
          }
          count={notificationCount}
          page={currentPage}
          onChangePage={(_, nextPage) => fetchNotifications(nextPage)}
        />
      </div>
    </Card>
  );
};

export default withStyles(styles)(NotificationsList);
