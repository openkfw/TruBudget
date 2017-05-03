import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import ReadIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';
import UnreadIcon from 'material-ui/svg-icons/communication/chat-bubble';
import AllIcon from 'material-ui/svg-icons/communication/chat'

import NotificationTable from './NotificationTable';

const styles = {
  headline: {

  },
  card: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    marginTop: '40px',
    flexDirection: 'column',
    alignItems:'center',
    zIndex: 1100
  },
};

const NotificationPage = ({ list, streamNames, users, loggedInUser, markNotificationAsRead }) => {
  return (
    <div style={styles.card}>
    <Card style={{width: '60%', marginBottom: '10px'}}>
      <CardTitle title="Notifications" subtitle="Unread" />
      <CardText>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
    </CardText>
      <NotificationTable
        notifications={list}
        filter="unread"
        streamNames={streamNames}
        users={users}
        loggedInUser={loggedInUser}
        markNotificationAsRead={markNotificationAsRead}/>
    </Card>
    <Card style={{width: '60%'}}>
      <CardTitle subtitle="Read" />
      <NotificationTable notifications={list} filter="read" streamNames={streamNames} users={users} loggedInUser={loggedInUser}/>
    </Card>
    </div>
  )
}

export default NotificationPage;
