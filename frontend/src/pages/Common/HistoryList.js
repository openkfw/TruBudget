import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import dayjs from "dayjs";
import React from "react";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";

const styles = {
  list: {
    maxWidth: "350px",
    minWidth: "350px"
  }
};

export default function HistoryList({ events, nEventsTotal, hasMore, isLoading, getUserDisplayname }) {
  const eventItems = events.map((event, index) => {
    const eventTime = event.getIn(["businessEvent", "time"]);
    return (
      <ListItem key={`${index}-${eventTime}`} className="history-item">
        <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
        <ListItemText
          primary={stringifyHistoryEvent(event, getUserDisplayname)}
          secondary={dayjs(eventTime).fromNow()}
        />
      </ListItem>
    );
  });

  return (
    <List
      id="history-list"
      subheader={<ListSubheader disableSticky>{strings.common.history}</ListSubheader>}
      style={styles.list}
    >
      {nEventsTotal === 0 ? (
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

function stringifyHistoryEvent(event, getUserDisplayname) {
  const businessEvent = event.get("businessEvent");
  const createdBy = getUserDisplayname(businessEvent.get("publisher"));
  const eventType = businessEvent.get("type");
  const displayName = event.getIn(["snapshot", "displayName"]) || "";

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
        getUserDisplayname(businessEvent.get("assignee"))
      );
    case "project_closed":
      return formatString(strings.history.project_close, createdBy, displayName);
    case "project_permission_granted":
      return formatString(
        strings.history.project_grantPermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("grantee")),
        displayName
      );
    case "project_permission_revoked":
      return formatString(
        strings.history.project_revokePermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("revokee")),
        displayName
      );

    case "subproject_created":
      return formatString(strings.history.subproject_create, createdBy, displayName);
    case "subproject_assigned":
      return formatString(
        strings.history.subproject_assign,
        createdBy,
        displayName,
        getUserDisplayname(businessEvent.get("assignee"))
      );
    case "subproject_updated":
      return formatString(strings.history.subproject_update, createdBy, displayName);
    case "subproject_closed":
      return formatString(strings.history.subproject_close, createdBy, displayName);
    case "subproject_permission_granted":
      return formatString(
        strings.history.subproject_grantPermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("grantee")),
        displayName
      );
    case "subproject_permission_revoked":
      return formatString(
        strings.history.subproject_revokePermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("revokee")),
        displayName
      );
    case "workflowitems_reordered":
      return formatString(strings.history.subproject_reorderWorkflowitems, createdBy, displayName);

    case "workflowitem_created":
      return formatString(strings.history.subproject_createWorkflowitem, createdBy, displayName);
    case "workflowitem_updated":
      const update = businessEvent.get("update");
      return update.has("documents") && !update.get("documents").isEmpty()
        ? formatString(strings.history.workflowitem_update_docs, createdBy, displayName)
        : formatString(strings.history.workflowitem_update, createdBy, displayName);
    case "workflowitem_assigned":
      return formatString(
        strings.history.workflowitem_assign,
        createdBy,
        displayName,
        getUserDisplayname(businessEvent.get("assignee"))
      );
    case "workflowitem_closed":
      return formatString(strings.history.workflowitem_close, createdBy, displayName);
    case "workflowitem_permission_granted":
      return formatString(
        strings.history.workflowitem_grantPermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("grantee")),
        displayName
      );
    case "workflowitem_permission_revoked":
      return formatString(
        strings.history.workflowitem_revokePermission_details,
        createdBy,
        strings.permissions[eventType],
        getUserDisplayname(businessEvent.get("revokee")),
        displayName
      );
    default:
      console.log(`WARN: no handler for event type ${eventType}`);
      return eventType;
  }
}
