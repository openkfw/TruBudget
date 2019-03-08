import { fromJS } from "immutable";
import sortBy from "lodash/sortBy";
import React, { Component } from "react";
import { connect } from "react-redux";
// import { formatUpdateString } from "../../helper";
import { formatString, toJS } from "../../helper";
import strings from "../../localizeStrings";
import { formatPermission } from "../Common/History/helper";
import ResourceHistory from "../Common/History/ResourceHistory";
import { hideHistory } from "../Notifications/actions";
import { fetchProjectHistory, setProjectHistoryOffset } from "./actions";

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
    // check old and new intents
    case "project_created":
    case "global.createProject":
      return formatString(strings.history.project_create, createdBy, snapshot.displayName);
    case "project_permission_granted":
    case "project.intent.grantPermission":
      return formatString(strings.history.project_grantPermission, createdBy, formatPermission(data), data.identity);
    case "project_permission_revoked":
    case "project.intent.revokePermission":
      return formatString(strings.history.project_revokePermission, createdBy, formatPermission(data), data.identity);
    case "project_createSubprojected":
    case "project.createSubproject":
      return formatString(strings.history.project_createSubproject, createdBy, snapshot.displayName);
    case "project_assigned":
    case "project.assign":
      return formatString(strings.history.project_assign, createdBy, snapshot.displayName, data.identity);
    case "subproject_assigned":
    case "subproject.assign":
      return formatString(strings.history.subproject_assign, createdBy, snapshot.displayName, data.identity);
    case "subproject_closed":
    case "subproject.close":
      return formatString(strings.history.subproject_close, createdBy, snapshot.displayName);
    case "subproject_intent.grantPermissioned":
    case "subproject.intent.grantPermission":
      return formatString(strings.history.project_grantPermission, createdBy, "", "subproject");
    case "project_updated":
    case "project.update":
      return strings.formatString(strings.history.changed_by, snapshot.displayName, createdBy);
    case "subproject_updated":
    case "subproject.update":
      return strings.formatString(strings.history.changed_by, snapshot.displayName, createdBy);
    case "subproject_intent.revokePermissioned":
    case "subproject.intent.revokePermission":
      return formatString(
        strings.history.subproject_revokePermission_details,
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

class ProjectHistoryContainer extends Component {
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
    const newOffset = this.props.offset + this.props.limit;
    this.props.fetchProjectHistory(this.props.projectId, newOffset, this.props.limit);
  };

  render() {
    return (
      <ResourceHistory
        fetchNextHistoryItems={this.fetchNextHistoryItems}
        isLoading={this.state.isLoading}
        resourceHistory={this.state.resourceHistory}
        mapIntent={mapIntent}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.getIn(["detailview", "historyItems"]),
    historyItemsCount: state.getIn(["detailview", "historyItemsCount"]),
    show: state.getIn(["notifications", "showHistory"]),
    isLoading: state.getIn(["detailview", "isHistoryLoading"])
  };
};
const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(hideHistory()),
    setProjectHistoryOffset: offset => dispatch(setProjectHistoryOffset(offset)),
    fetchProjectHistory: (projectId, offset, limit) => dispatch(fetchProjectHistory(projectId, offset, limit, false))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectHistoryContainer));
