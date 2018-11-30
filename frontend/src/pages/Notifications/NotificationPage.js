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

const NotificationPage = ({ notifications, streamNames, users, loggedInUser, markNotificationAsRead, history, markAllNotificationAsRead }) => {
  return (
    <div>
      {/* <Card style={{ width: "100%", marginBottom: "10px" }}>
        <CardHeader
          title={strings.notification.notification_title}
          subheader={strings.notification.notification_subtitle}
        />
        <CardContent>
          <Typography>{strings.notification.notification_card_text}</Typography>
        </CardContent>
      </Card> */}
      <NotificationList
        notifications={notifications}
        history={history}
        markNotificationAsRead={markNotificationAsRead}
        markAllNotificationAsRead={markAllNotificationAsRead}
      />
    </div>
  );
};

export default NotificationPage;
