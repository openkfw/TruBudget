import React, { Component } from "react";
import { connect } from "react-redux";
import { fromJS } from "immutable";
import sortBy from "lodash/sortBy";

import RessourceHistory from "../Common/History/RessourceHistory";
import { hideHistory } from "../Notifications/actions";
import strings from "../../localizeStrings";

const calculateHistory = items => {
  return sortBy(
    items.reduce((acc, item) => {
      return acc.concat(item.get("log").toJS());
    }, []),
    "createdAt"
  ).reverse();
};

const mapIntent = (intent, data) => {
  switch (intent) {
    case "subproject.createWorkflowitem":
      return `Created workflow item ${data.workflowitem.displayName}`;
    case "workflowitem.close":
      return `Closed workflow item ???`;
    case "workflowitem.intent.grantPermission":
      return `Granted permission "${strings.permissions[data.intent.replace(/[.]/g, "_")] || data.intent}" to ${
        data.userId
      }`;
    default:
      console.log(intent);
      console.log(data);
      return "Intent not defined";
  }
};

class SubProjectHistoryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ressourceHistory: [],
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
    items: state.getIn(["workflow", "workflowItems"]),
    show: state.getIn(["notifications", "showHistory"])
  };
};
const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(hideHistory())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SubProjectHistoryContainer);
