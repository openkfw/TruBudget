import React from "react";
import moment from "moment";
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table";
import { ListItem } from "material-ui/List";
import Button from "material-ui/Button";
import strings from "../../localizeStrings";
import { roleMapper } from "../../helper";
const styles = {
  notSelected: {
    fontWeight: "bold"
  },
  column: {
    whiteSpace: "normal",
    wordWrap: "break-word"
  },
  columnNonBreaking: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
  },
  listitem: {
    paddingLeft: "0px",
    paddingRight: "0px"
  },
  by: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
  }
};

const viewItem = (data, history) => {
  history.push(data.link);
};

// TODO: we should not do this, lets make an api endpoint
const markAllRead = (loggedInUser, markNotificationAsRead, notifications) => {
  notifications.forEach(notification => {
    markNotificationAsRead(loggedInUser.id, notification.key, notification.data);
  });
};
/*
   create_workflow: 'Assigned workflow item {0} to you',
      edit_workflow: 'Assigned workflow item {0} to you',
      create_transaction: 'Assigned transaction {0} to you',
      edit_transaction: 'Assigned transaction {0} to you',
      review_workflow: 'You are assigned to review the workflow item {0}',
      review_transaction: 'You are assigned to review the transaction {0} '
      */
const getDescription = data => {
  const { action, workflowItem } = data;

  const templateString = strings.notification[action];
  return strings.formatString(templateString, workflowItem);
};
const getNotifications = (
  notifications,
  filter = "all",
  streamNames,
  users,
  loggedInUser,
  markNotificationAsRead,
  history
) => {
  return notifications.reduce((acc, { data, blocktime, key }, index) => {
    const role = data.role;
    const issuer = users[data.issuer];
    const description = getDescription(data);
    const notificationRead = data.done === true;

    const element = (
      <TableRow
        key={index}
        style={notificationRead ? {} : styles.notSelected}
        onTouchTap={notificationRead ? undefined : () => markNotificationAsRead(loggedInUser.id, key, data)}
      >
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">
          {streamNames[data.project] ? streamNames[data.project] : data.project}
        </TableRowColumn>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="3">
          {streamNames[data.subProject] ? streamNames[data.subProject] : data.subProject}
        </TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="5">
          {description}
        </TableRowColumn>
        <TableRowColumn colSpan="3">
          <ListItem
            disabled
            innerDivStyle={styles.listitem}
            style={styles.by}
            primaryText={<div style={styles.by}>{issuer.name}</div>}
            secondaryText={
              <div style={styles.by}>{data.created ? moment(data.created, "x").fromNow() : "Processing ..."}</div>
            }
          />
        </TableRowColumn>
        <TableRowColumn style={styles.columnNonBreaking} colSpan="2">
          {roleMapper[role]}
        </TableRowColumn>
        <TableRowColumn style={styles.column} colSpan="2">
          <Button primary={true} onTouchTap={() => viewItem(data, history)}>
            {strings.notification.notification_table_view}
          </Button>
        </TableRowColumn>
      </TableRow>
    );

    switch (filter) {
      case "read":
        if (notificationRead) acc.push(element);
        break;
      case "unread":
        if (!notificationRead) acc.push(element);
        break;
      default:
        acc.push(element);
    }

    return acc;
  }, []);
};

const NotificationTable = ({
  notifications,
  filter,
  streamNames,
  users,
  loggedInUser,
  markNotificationAsRead,
  history
}) => {
  const tableEntries = getNotifications(
    notifications,
    filter,
    streamNames,
    users,
    loggedInUser,
    markNotificationAsRead,
    history
  );
  return (
    <Table multiSelectable={false}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn style={styles.column} colSpan="3">
            {strings.notification.notification_table_project}
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="3">
            {strings.notification.notification_table_subproject}
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="5">
            {strings.notification.notification_table_description}
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="3">
            {strings.notification.notification_table_by}
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.column} colSpan="2">
            {strings.notification.notification_table_role}
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.columnNonBreaking} colSpan="2">
            <Button onTouchTap={() => markAllRead(loggedInUser, markNotificationAsRead, notifications)}>
              {strings.notification.notification_table_all_read}
            </Button>
          </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody showRowHover={false} displayRowCheckbox={false} adjustForCheckbox={false}>
        {tableEntries}
      </TableBody>
    </Table>
  );
};

export default NotificationTable;
