import React from 'react';
import moment from 'moment';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

const getNotifications = (notifications, filter = 'all', streamNames, users, loggedInUser, markNotificationAsRead) => {
  return notifications.reduce((acc, { data, blocktime, key }, index) => {
    const issuer = users[data.issuer];
    const notificationRead = data.done === true;
    const element = (
      <TableRow key={index} selected={notificationRead} selectable={false}>
        <TableRowColumn colSpan="1">
          <Checkbox checked={notificationRead} disabled={notificationRead} onTouchTap={() => markNotificationAsRead(loggedInUser.id, key, data)}/>
        </TableRowColumn>
        <TableRowColumn colSpan="3">{streamNames[data.project] ? streamNames[data.project] : data.project}</TableRowColumn>
        <TableRowColumn colSpan="3">{streamNames[data.subProject] ? streamNames[data.subProject] : data.subProject}</TableRowColumn>
        <TableRowColumn colSpan="5">{data.description}</TableRowColumn>
        <TableRowColumn colSpan="3">
          <ListItem
            primaryText={issuer.name}
            secondaryText={moment(blocktime, 'X').fromNow()}
          />
        </TableRowColumn>
      </TableRow>
    );

    switch (filter) {
      case 'read':
        if (notificationRead) acc.push(element);
        break;
      case 'unread':
        if (!notificationRead) acc.push(element);
        break;
      default:
        acc.push(element);
    }

    return acc;
  }, []);
}

const NotificationTable = ({ notifications, filter, streamNames, users, loggedInUser, markNotificationAsRead }) => {
  const tableEntries = getNotifications(notifications, filter, streamNames, users, loggedInUser, markNotificationAsRead);
  return (
    <Table
      multiSelectable={false}
    >
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn colSpan="1">Read</TableHeaderColumn>
          <TableHeaderColumn colSpan="3">Project</TableHeaderColumn>
          <TableHeaderColumn colSpan="3">Subproject</TableHeaderColumn>
          <TableHeaderColumn colSpan="5">Description</TableHeaderColumn>
          <TableHeaderColumn colSpan="3">By</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        displayRowCheckbox={false}
        adjustForCheckbox={false}>
        {tableEntries}
      </TableBody>
    </Table>
  )
}

export default NotificationTable;
