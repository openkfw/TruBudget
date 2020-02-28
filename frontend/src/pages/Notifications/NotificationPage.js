import React from "react";

import NotificationList from "./NotificationList";

const NotificationPage = ({
  notifications,
  markNotificationAsRead,
  history,
  markMultipleNotificationsAsRead,
  setNotifcationsPerPage,
  notificationsPerPage,
  fetchNotifications,
  notificationCount,
  notificationOffset,
  currentPage,
  isDataLoading
}) => {
  return (
    <div>
      <NotificationList
        notifications={notifications}
        history={history}
        markNotificationAsRead={markNotificationAsRead}
        markMultipleNotificationsAsRead={markMultipleNotificationsAsRead}
        setNotifcationsPerPage={setNotifcationsPerPage}
        notificationsPerPage={notificationsPerPage}
        fetchNotifications={fetchNotifications}
        notificationCount={notificationCount}
        notificationOffset={notificationOffset}
        currentPage={currentPage}
        isDataLoading={isDataLoading}
      />
    </div>
  );
};

export default NotificationPage;
