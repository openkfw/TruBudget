import React from "react";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import TablePagination from "@mui/material/TablePagination";

import strings from "../../localizeStrings";

import NotificationEmptyState from "./NotificationEmptyState";
import NotificationListItems from "./NotificationListItems";

import "./NotificationList.scss";

const markPageAsRead = (markMultipleNotificationsAsRead, notifications, notificationPage) => {
  const notificationIds = notifications.map((notification) => notification.id);
  markMultipleNotificationsAsRead(notificationIds, notificationPage);
};

const onChangeRowsPerPage = (newNotificationsPerPage, setNotifcationsPerPage, fetchNotifications) => {
  setNotifcationsPerPage(newNotificationsPerPage);
  //Fetch first page again
  fetchNotifications(0);
};

const NotificationList = (props) => {
  const {
    markMultipleNotificationsAsRead,
    notifications,
    setNotifcationsPerPage,
    notificationsPerPage,
    fetchNotifications,
    notificationCount,
    notificationOffset,
    history,
    markNotificationAsRead,
    currentPage,
    isDataLoading
  } = props;
  const allNotificationsRead = notifications.some((notification) => notification.isRead === false);
  const rowsPerPageOptions = [5, 10, 20, 50];
  return (
    <Card>
      <CardHeader title="Notifications" action={null} />
      <div className="read-all-button-container">
        <Button
          variant="outlined"
          onClick={() => markPageAsRead(markMultipleNotificationsAsRead, notifications, currentPage)}
          className="read-all-button"
          data-test="read-multiple-notifications"
          disabled={!allNotificationsRead}
        >
          {strings.notification.read_all}
        </Button>
      </div>

      {isDataLoading ? (
        <div />
      ) : (
        <List component="div" data-test="notification-list">
          {notifications.length > 0 ? (
            <NotificationListItems
              notifications={notifications}
              history={history}
              markNotificationAsRead={(notificationId) => markNotificationAsRead(notificationId, currentPage)}
              notificationsPerPage={notificationsPerPage}
              notificationOffset={notificationOffset}
            />
          ) : (
            <NotificationEmptyState />
          )}
        </List>
      )}
      <div className="notifications-pagination">
        <TablePagination
          component="div"
          rowsPerPageOptions={rowsPerPageOptions}
          rowsPerPage={notificationsPerPage}
          onRowsPerPageChange={(event) =>
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
          onPageChange={(_, nextPage) => fetchNotifications(nextPage)}
          getItemAriaLabel={(where) => {
            if (where === "previous") return strings.notification.previous_page;
            return strings.notification.next_page;
          }}
          labelRowsPerPage={strings.notification.rows_per_page}
        />
      </div>
    </Card>
  );
};

export default NotificationList;
