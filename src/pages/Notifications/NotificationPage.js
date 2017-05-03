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
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  },
};

const NotificationPage = ({ list, streamNames, users }) => {
  return (
    <div style={styles.card}>
    <Card style={{marginBottom: '10px'}}>
      <CardTitle title="Notifications" subtitle="Unread" />
      <CardText>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
    </CardText>
      <NotificationTable notifications={list} filter="unread" streamNames={streamNames} users={users}/>
    </Card>
    <Card>
      <CardTitle subtitle="Read" />
      <NotificationTable notifications={list} filter="read" streamNames={streamNames} users={users}/>
    </Card>
    </div>
  )
}

export default NotificationPage;
