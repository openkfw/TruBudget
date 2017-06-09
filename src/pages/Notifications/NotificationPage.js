import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import NotificationTable from './NotificationTable';

const styles = {
  headline: {

  },
  card: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1100
  },
};

const NotificationPage = ({ list, streamNames, users, loggedInUser, markNotificationAsRead, history }) => {

  return (
    <div style={styles.card}>
      <Card style={{ width: '100%', marginBottom: '10px' }}>
        <CardTitle title="Notifications" subtitle="Unread" />
        <CardText>
          Please find your current notifications below. These display action items or information items to be dealt with.
    </CardText>
        <NotificationTable
          history={history}
          notifications={list}
          filter="unread"
          streamNames={streamNames}
          users={users}
          loggedInUser={loggedInUser}
          markNotificationAsRead={markNotificationAsRead} />
      </Card>
      <Card>
        <CardTitle subtitle="Read" />
        <NotificationTable notifications={list} filter="read" streamNames={streamNames} users={users} loggedInUser={loggedInUser} history={history} />
      </Card>
    </div>
  )
}

export default NotificationPage;
