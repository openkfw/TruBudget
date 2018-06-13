import React, { Component } from "react";
import { connect } from "react-redux";
import { fromJS } from "immutable";

import sortBy from "lodash/sortBy";

import RessourceHistory from "../Common/History/RessourceHistory";
import { hideHistory } from "../Notifications/actions";
import strings from "../../localizeStrings";
import { toJS, formatString, formatUpdateString } from "../../helper";
import { formatPermission } from "../Common/History/helper";

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
    case "project.createSubproject":
      return formatString(strings.history.project_createSubproject, createdBy, snapshot.displayName);
    case "subproject.createWorkflowitem":
      return formatString(strings.history.subproject_createWorkflowitem, createdBy, snapshot.displayName);
    case "subproject.assign":
      return formatString(strings.history.subproject_assign, createdBy, snapshot.displayName, data.userId);
    case "workflowitem.close":
      return formatString(strings.history.workflowitem_close, createdBy, snapshot.displayName);
    case "subproject.close":
      return formatString(strings.history.subproject_close, createdBy, snapshot.displayName);
    case "subproject.intent.grantPermission":
      return formatString(strings.history.subproject_grantPermission, createdBy, formatPermission(data), data.userId);
    case "workflowitem.intent.grantPermission":
      return formatString(strings.history.workflowitem_grantPermission, createdBy, formatPermission(data), data.userId);
    case "subproject.intent.revokePermission":
      return formatString(strings.history.subproject_revokePermission, createdBy, formatPermission(data), data.userId);
    case "workflowitem.update":
      return formatUpdateString(strings.common.workflowItem, createdBy, data);
    case "subproject.update":
      return formatUpdateString(strings.common.subproject, createdBy, data);
    case "workflowitem.intent.revokePermission":
      return formatString(
        strings.history.workflowitem_revokePermission,
        createdBy,
        formatPermission(data),
        data.userId,
        snapshot.displayName
      );
    case "workflowitem.assign":
      return formatString(strings.history.workflowitem_assign, createdBy, snapshot.displayName, data.userId);
    default:
      console.log(intent);
      return "Intent not defined";
  }
};

class SubProjectHistoryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ressourceHistory: fromJS([]),
      items: fromJS([])
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // only calculate if history is shown and workflow state changed
    if (nextProps.show && nextProps.items !== prevState.items) {
      const ressourceHistory = calculateHistory(nextProps.items);
      return {
        items: nextProps.items,
        ressourceHistory
      };
    } else {
      return {
        ...prevState
      };
    }
  }

  render() {
    return <RessourceHistory ressourceHistory={this.state.ressourceHistory} mapIntent={mapIntent} {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    items: state.getIn(["workflow", "historyItems"]),
    show: state.getIn(["notifications", "showHistory"])
  };
};
const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(hideHistory())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectHistoryContainer));
