import React, { Component } from "react";
import { connect } from "react-redux";
import { fromJS } from "immutable";

import sortBy from "lodash/sortBy";

import RessourceHistory from "../Common/History/RessourceHistory";
import { hideHistory } from "../Notifications/actions";
import strings from "../../localizeStrings";
import { toJS } from "../../helper";

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
      return `${createdBy} created subproject ${snapshot.displayName}`;
    case "subproject.createWorkflowitem":
      return `${createdBy} created workflow item ${snapshot.displayName}`;
    case "subproject.assign":
      return `${createdBy} assigned subproject ${snapshot.displayName} to ${data.userId}`;
    case "workflowitem.close":
      return `${createdBy} closed workflow item ${snapshot.displayName}`;
    case "workflowitem.intent.grantPermission":
      return `${createdBy} granted permission "${strings.permissions[data.intent.replace(/[.]/g, "_")] ||
        data.intent}" to ${data.userId}`;
    case "workflowitem.assign":
      return `${createdBy} assigned workflowitem ${snapshot.displayName} to ${data.userId}`;
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
      console.log(ressourceHistory);
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
