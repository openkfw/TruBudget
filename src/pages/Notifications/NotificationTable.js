import React from 'react';
import moment from 'moment';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ReadIcon from 'material-ui/svg-icons/navigation/check';

import { ACMECorpGreen, ACMECorpLightgreen } from '../../colors.js';

const styles = {
  column: {
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  },
  columnNonBreaking: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  listitem: {
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  by: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  }
}


const getNotifications = (notifications, filter = 'all', streamNames, users, loggedInUser, markNotificationAsRead) => {
  return notifications.reduce((acc, { data, blocktime, key }, index) => {
    const issuer = users[data.issuer];
    const notificationRead = data.done === true;
    const element = (
      <TableRow key={index} selected={notificationRead} selectable={false}>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">{streamNames[data.project] ? streamNames[data.project] : data.project}</TableRowColumn>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">{streamNames[data.subProject] ? streamNames[data.subProject] : data.subProject}</TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="5">{data.description}</TableRowColumn>
        <TableRowColumn colSpan="3">
          <ListItem
            disabled
            innerDivStyle={styles.listitem}
            style={styles.by}
            primaryText={<div style={styles.by}>{issuer.name}</div>}
            secondaryText={<div style={styles.by}>{blocktime ? moment(blocktime, 'X').fromNow() : 'Processing ...'}</div>}
          />
        </TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="2">
          <IconButton disabled={notificationRead} onTouchTap={() => markNotificationAsRead(loggedInUser.id, key, data)} tooltip="Mark as read">
            <ReadIcon color={ACMECorpLightgreen} hoverColor={ACMECorpGreen} />
          </IconButton>
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
          <TableHeaderColumn style={styles.column} colSpan="3">Project</TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="3">Subproject</TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="5">Description</TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="3">By</TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="2"></TableHeaderColumn>
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
