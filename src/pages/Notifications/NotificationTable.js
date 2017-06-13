import React from 'react';
import moment from 'moment';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ReadIcon from 'material-ui/svg-icons/navigation/check';
import FlatButton from 'material-ui/FlatButton';
import { ACMECorpGreen, ACMECorpLightgreen } from '../../colors.js';

const styles = {
  notSelected: {
    fontWeight: 'bold',
  },
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

const viewItem = (data, history) => {
  history.push(data.link);
}

// TODO: we should not do this, lets make an api endpoint
const markAllRead = (loggedInUser, markNotificationAsRead, notifications) => {
  notifications.forEach((notification) => {
    markNotificationAsRead(loggedInUser.id, notification.key, notification.data);
  });
}

const getNotifications = (notifications, filter = 'all', streamNames, users, loggedInUser, markNotificationAsRead, history) => {

  return notifications.reduce((acc, { data, blocktime, key }, index) => {
    const issuer = users[data.issuer];
    const notificationRead = data.done === true;
    const viewable = data.link === '/dashboard' ? false : !data.done

    const element = (
      <TableRow key={index} style={notificationRead ? {} : styles.notSelected} onTouchTap={notificationRead ? undefined : () => markNotificationAsRead(loggedInUser.id, key, data)}>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">{streamNames[data.project] ? streamNames[data.project] : data.project}</TableRowColumn>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">{streamNames[data.subProject] ? streamNames[data.subProject] : data.subProject}</TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="5">{data.description}</TableRowColumn>
        <TableRowColumn colSpan="3">
          <ListItem
            disabled
            innerDivStyle={styles.listitem}
            style={styles.by}
            primaryText={<div style={styles.by}>{issuer.name}</div>}
            secondaryText={<div style={styles.by}>{data.created ? moment(data.created, 'x').fromNow() : 'Processing ...'}</div>}
          />
        </TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="2">
          <FlatButton label="View" primary={true} onTouchTap={() => viewItem(data, history)} />
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

const NotificationTable = ({ notifications, filter, streamNames, users, loggedInUser, markNotificationAsRead, history }) => {
  const tableEntries = getNotifications(notifications, filter, streamNames, users, loggedInUser, markNotificationAsRead, history);
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
          <TableHeaderColumn style={styles.columnNonBreaking} colSpan="2"><FlatButton label="all read" onTouchTap={() => markAllRead(loggedInUser, markNotificationAsRead, notifications)} /></TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        showRowHover={false}
        displayRowCheckbox={false}
        adjustForCheckbox={false}>
        {tableEntries}
      </TableBody>
    </Table>
  )
}

export default NotificationTable;
