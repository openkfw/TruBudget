import React from 'react';
import moment from 'moment';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';

const getNotifications = (notifications, filter = 'all') => {
  return notifications.reduce((acc, { data, blocktime }, index) => {
    const notificationRead = data.read === true;
    const element = (
      <TableRow key={index} selected={notificationRead} selectable={false}>
        <TableRowColumn colSpan="1">
          <Checkbox checked={notificationRead} disabled={notificationRead}/>
        </TableRowColumn>
        <TableRowColumn colSpan="5">{data.description}</TableRowColumn>
        <TableRowColumn colSpan="3">{moment(blocktime, 'X').fromNow()}</TableRowColumn>
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

const NotificationTable = ({ notifications, filter }) => {
  const tableEntries = getNotifications(notifications, filter);
  return (
    <Table
      multiSelectable={true}
    >
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn colSpan="1">Read</TableHeaderColumn>
          <TableHeaderColumn colSpan="5">Description</TableHeaderColumn>
          <TableHeaderColumn colSpan="3">Last update</TableHeaderColumn>
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
