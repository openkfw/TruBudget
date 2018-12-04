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
  notificationPage,
  setNotificationPage,
  notificationCount,
  setLastFetchedBeforeId,
  setLastFetchedAfterId,
  lastFetchedBeforeId,
  lastFetchedAfterId
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
        notificationPage={notificationPage}
        setNotificationPage={setNotificationPage}
        notificationCount={notificationCount}
        setLastFetchedBeforeId={setLastFetchedBeforeId}
        setLastFetchedAfterId={setLastFetchedAfterId}
        lastFetchedBeforeId={lastFetchedBeforeId}
        lastFetchedAfterId={lastFetchedAfterId}
      />
    </div>
  );
};

export default NotificationPage;
