import { fromJS } from "immutable";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import { connect } from "react-redux";

import { formatString, toJS } from "../../helper";
import strings from "../../localizeStrings";
import { formatPermission } from "../Common/History/helper";
import ResourceHistory from "../Common/History/ResourceHistory";
import { hideHistory } from "../Notifications/actions";
import { fetchSubprojectHistory, setSubProjectHistoryOffset } from "./actions";

const calculateHistory = items => {
  return sortBy(
    items.reduce((acc, item) => {
      return acc.concat(item);
    }, []),
    "createdAt"
  ).reverse();
};

const mapIntent = ({ createdBy, intent, data, snapshot }) => {
  switch (intent) {
    case "subproject_created":
      return formatString(strings.history.subproject_create, createdBy, snapshot.displayName);
    case "subproject_assigned":
      return formatString(strings.history.subproject_assign, createdBy, snapshot.displayName, data.identity);
    case "subproject_updated":
      return formatString(strings.history.subproject_update, createdBy, snapshot.displayName);
    case "subproject_closed":
      return formatString(strings.history.subproject_close, createdBy, snapshot.displayName);
    case "subproject_items_reordered":
      return formatString(strings.history.subproject_reorderWorkflowitems, createdBy, snapshot.displayName);
    case "subproject_permission_granted":
      return formatString(
        strings.history.subproject_grantPermission_details,
        createdBy,
        formatPermission(data),
        data.identity,
        snapshot.displayName
      );
    case "subproject_permission_revoked":
      return formatString(
        strings.history.subproject_revokePermission_details,
        createdBy,
        formatPermission(data),
        data.identity,
        snapshot.displayName
      );
    case "workflowitem_created":
      return formatString(strings.history.subproject_createWorkflowitem, createdBy, snapshot.displayName);
    case "workflowitem_updated":
      return isEmpty(data.update)
        ? formatString(strings.history.workflowitem_update, createdBy, snapshot.displayName)
        : formatString(strings.history.workflowitem_update_docs, createdBy, snapshot.displayName);
    case "workflowitem_assigned":
      return formatString(strings.history.workflowitem_assign, createdBy, snapshot.displayName, data.identity);
    case "workflowitem_closed":
      return formatString(strings.history.workflowitem_close, createdBy, snapshot.displayName);
    case "workflowitem_permission_granted":
      return formatString(
        strings.history.workflowitem_grantPermission_details,
        createdBy,
        formatPermission(data),
        data.identity,
        snapshot.displayName
      );
    case "workflowitem_permission_revoked":
      return formatString(
        strings.history.workflowitem_revokePermission_details,
        createdBy,
        formatPermission(data),
        data.identity,
        snapshot.displayName
      );
    default:
      console.log("WARN: Intent not defined:", intent);
      return intent;
  }
};

class SubProjectHistoryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceHistory: fromJS([]),
      items: fromJS([])
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // only calculate if history is shown and workflow state changed
    if (nextProps.show && nextProps.items !== prevState.items) {
      const resourceHistory = calculateHistory(nextProps.items);
      return {
        items: nextProps.items,
        resourceHistory
      };
    } else {
      return {
        ...prevState
      };
    }
  }

  fetchNextHistoryItems = () => {
    this.props.fetchSubProjectHistory(
      this.props.projectId,
      this.props.subprojectId,
      this.props.offset,
      this.props.limit
    );
  };

  render() {
    return (
      <ResourceHistory
        resourceHistory={this.state.resourceHistory}
        fetchNextHistoryItems={this.fetchNextHistoryItems}
        mapIntent={mapIntent}
        userDisplayNameMap={this.state.userDisplayNameMap}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.getIn(["workflow", "historyItems"]),
    historyItemsCount: state.getIn(["workflow", "historyItemsCount"]),
    show: state.getIn(["notifications", "showHistory"]),
    userDisplayNameMap: state.getIn(["login", "userDisplayNameMap"])
  };
};
const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(hideHistory()),
    setSubProjectHistoryOffset: offset => dispatch(setSubProjectHistoryOffset(offset)),
    fetchSubProjectHistory: (projectId, subprojectId, offset, limit) =>
      dispatch(fetchSubprojectHistory(projectId, subprojectId, offset, limit, false))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectHistoryContainer));
