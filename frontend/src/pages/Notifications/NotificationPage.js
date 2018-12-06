import React from "react";

import NotificationList from "./NotificationList";

// const styles = {
//   headline: {},
//   card: {
//     width: "100%",
//     position: "relative",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     zIndex: 1100
//   }
// };

const NotificationPage = ({
  notifications,
  markNotificationAsRead,
  history,
  markAllNotificationAsRead,
  setNotifcationsPerPage,
  notificationsPerPage,
  fetchNotifications,
  notificationCount,
  notificationOffset,
  setNotificationOffset
}) => {
  return (
    <div>
      <NotificationList
        notifications={notifications}
        history={history}
        markNotificationAsRead={markNotificationAsRead}
        markAllNotificationAsRead={markAllNotificationAsRead}
        setNotifcationsPerPage={setNotifcationsPerPage}
        notificationsPerPage={notificationsPerPage}
        fetchNotifications={fetchNotifications}
        notificationCount={notificationCount}
        setNotificationOffset={setNotificationOffset}
        notificationOffset={notificationOffset}
      />
    </div>
  );
};

export default NotificationPage;
