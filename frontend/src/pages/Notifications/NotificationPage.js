import React from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";

import NotificationTable from "./NotificationTable";
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

const NotificationPage = ({ list, streamNames, users, loggedInUser, markNotificationAsRead, history }) => {
  return (
    <div style={styles.card}>
      <Card style={{ width: "100%", marginBottom: "10px" }}>
        <CardHeader
          title={strings.notification.notification_title}
          subtitle={strings.notification.notification_subtitle}
        />
        <CardContent>{strings.notification.notification_card_text}</CardContent>
        <NotificationTable
          history={history}
          notifications={list}
          streamNames={streamNames}
          users={users}
          loggedInUser={loggedInUser}
          markNotificationAsRead={markNotificationAsRead}
        />
      </Card>
    </div>
  );
};

export default NotificationPage;
