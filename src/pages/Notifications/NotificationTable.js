import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

const getNotifications = (notifications ) => {
  return notifications.map((notification, index) => {
    return (
      <TableRow key={index} selectable={true}>
        <TableRowColumn>{notification.description}</TableRowColumn>
      </TableRow>
    );
  });
}

const NotificationTable = ({notifications}) => {
  const tableEntries = getNotifications(notifications);
  return (
    <Table>
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Done</TableHeaderColumn>
          <TableHeaderColumn>Description</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        displayRowCheckbox={true}
        adjustForCheckbox={false}>>
      {tableEntries}
      </TableBody>
    </Table>
  )
}

export default NotificationTable;
