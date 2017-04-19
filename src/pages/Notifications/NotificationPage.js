import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import ReadIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';
import UnreadIcon from 'material-ui/svg-icons/communication/chat-bubble';
import AllIcon from 'material-ui/svg-icons/communication/chat'

import NotificationTable from './NotificationTable';

const NotificationPage = ({list}) => {
  return (
    <Card style={{
      width: '60%',
      left: '20%',
      top: '100px',
      position: 'absolute',
      zIndex: 1100,
    }}>
      <Tabs>
        <Tab
          icon={<UnreadIcon />}
          label="Unread">
          <NotificationTable notifications={list} filter="unread"/>
        </Tab>
        <Tab
          icon={<ReadIcon />}
          label="Read">
          <NotificationTable notifications={list} filter="read"/>
        </Tab>
        <Tab
          icon={<AllIcon />}
          label="All">
          <NotificationTable notifications={list} filter="all"/>
        </Tab>
      </Tabs>
    </Card>
  )
}

export default NotificationPage;
