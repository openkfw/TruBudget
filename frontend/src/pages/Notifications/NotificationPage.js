import React from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import { Typography } from "@material-ui/core";

import NotificationTable from "./NotificationTable";
import NotificationList from "./NotificationList";
import strings from "../../localizeStrings";

const styles = {
  headline: {},
  card: {
    width: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1100
  }
};

const NotificationPage = ({ notifications, streamNames, users, loggedInUser, markNotificationAsRead, history }) => {
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
      />
    </div>
  );
};

export default NotificationPage;
