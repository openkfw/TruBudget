import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import dayjs from "dayjs";
import React from "react";
import _isEmpty from "lodash/isEmpty";
import { formatString } from "../../helper";
import { dateFormat } from "../../helper";
import strings from "../../localizeStrings";

const styles = {
  list: {
    maxWidth: "350px",
    minWidth: "350px"
  }
};

export default function HistoryList({ events, nEventsTotal, hasMore, isLoading, getUserDisplayname }) {
  const eventItems = events.map((event, index) => {
    if (!(event.businessEvent && event.snapshot)) {
      // eslint-disable-next-line no-console
      console.warn("The event does not have a business event or snapshot and will not be displayed", event);

      return null;
    }
    const eventTime = event.businessEvent.time;
    return (
      <ListItem key={`${index}-${eventTime}`} className="history-item">
        <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
        <ListItemText
          data-test={`history-item-${index}`}
          primary={stringifyHistoryEvent(event.businessEvent, event.snapshot, getUserDisplayname)}
          secondary={dayjs(eventTime).format(dateFormat())}
        />
      </ListItem>
    );
  });

  return (
    <List
      data-test="history-list"
      subheader={<ListSubheader disableSticky>{strings.common.history}</ListSubheader>}
      style={styles.list}
    >
      {!isLoading && nEventsTotal === 0 ? (
        <ListItem key="no-element">
          <Avatar alt={""} src="" />
          <ListItemText primary="" secondary={strings.common.no_history} />
        </ListItem>
      ) : (
        <div>
          {eventItems}
          {hasMore || isLoading ? null : (
            <ListItem key="closing-element">
              <Avatar alt={""} src="" />
              <ListItemText primary="" secondary={strings.common.history_end} />
            </ListItem>
          )}
        </div>
      )}
    </List>
  );
}

const formatPermission = data => `"${strings.permissions[data.replace(/[.]/g, "_")]}"` || `"${data.intent}"`;

function stringifyHistoryEvent(businessEvent, snapshot, getUserDisplayname) {
  const createdBy = getUserDisplayname(businessEvent.publisher);
  const eventType = businessEvent.type;
  const displayName = snapshot.displayName || "";

  switch (eventType) {
    case "project_created":
      return formatString(strings.history.project_create, createdBy, displayName);
    case "project_updated":
      return formatString(strings.history.project_update, createdBy, displayName);
    case "project_assigned":
      return formatString(
        strings.history.project_assign,
        createdBy,
        displayName,
        getUserDisplayname(businessEvent.assignee)
      );
    case "project_closed":
      return formatString(strings.history.project_close, createdBy, displayName);
    case "project_permission_granted":
      return formatString(
        strings.history.project_grantPermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.grantee),
        displayName
      );
    case "project_permission_revoked":
      return formatString(
        strings.history.project_revokePermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.revokee),
        displayName
      );
    case "project_projected_budget_updated":
      return formatString(strings.history.project_projected_budget_updated, createdBy, businessEvent.organization);
    case "project_projected_budget_deleted":
      return formatString(strings.history.project_projected_budget_deleted, createdBy, businessEvent.organization);
    case "subproject_created":
      return formatString(strings.history.subproject_create, createdBy, displayName);
    case "subproject_assigned":
      return formatString(
        strings.history.subproject_assign,
        createdBy,
        displayName,
        getUserDisplayname(businessEvent.assignee)
      );
    case "subproject_updated":
      return formatString(strings.history.subproject_update, createdBy, displayName);
    case "subproject_closed":
      return formatString(strings.history.subproject_close, createdBy, displayName);
    case "subproject_permission_granted":
      return formatString(
        strings.history.subproject_grantPermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.grantee),
        displayName
      );
    case "subproject_permission_revoked":
      return formatString(
        strings.history.subproject_revokePermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.revokee),
        displayName
      );
    case "workflowitems_reordered":
      return formatString(strings.history.subproject_reorderWorkflowitems, createdBy, displayName);

    case "workflowitem_created":
      return formatString(strings.history.subproject_createWorkflowitem, createdBy, displayName);
    case "workflowitem_updated":
      const update = businessEvent.update;
      return update.documents && !_isEmpty(update.documents)
        ? formatString(strings.history.workflowitem_update_docs, createdBy, displayName)
        : formatString(strings.history.workflowitem_update, createdBy, displayName);
    case "workflowitem_assigned":
      return formatString(
        strings.history.workflowitem_assign,
        createdBy,
        displayName,
        getUserDisplayname(businessEvent.assignee)
      );
    case "workflowitem_closed":
      return formatString(strings.history.workflowitem_close, createdBy, displayName);
    case "workflowitem_permission_granted":
      return formatString(
        strings.history.workflowitem_grantPermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.grantee),
        displayName
      );
    case "workflowitem_permission_revoked":
      return formatString(
        strings.history.workflowitem_revokePermission_details,
        createdBy,
        formatPermission(businessEvent.permission),
        getUserDisplayname(businessEvent.revokee),
        displayName
      );
    default:
      // eslint-disable-next-line no-console
      console.log(`WARN: no handler for event type ${eventType}`);
      return eventType;
  }
}
