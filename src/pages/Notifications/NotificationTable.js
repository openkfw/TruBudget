import React from 'react';
import moment from 'moment';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

const getNotifications = (notifications, filter = 'all', streamNames, users) => {
  return notifications.reduce((acc, { data, blocktime }, index) => {
    const issuer = users[data.issuer];
    const notificationRead = data.done === true;
    const element = (
      <TableRow key={index} selected={notificationRead} selectable={false}>
        <TableRowColumn colSpan="1">
          <Checkbox checked={notificationRead} disabled={notificationRead} />
        </TableRowColumn>
        <TableRowColumn colSpan="3">{data.project}</TableRowColumn>
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

const NotificationTable = ({ notifications, filter, streamNames, users }) => {
  const tableEntries = getNotifications(notifications, filter, streamNames, users);
  return (
    <Table
      multiSelectable={true}
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
