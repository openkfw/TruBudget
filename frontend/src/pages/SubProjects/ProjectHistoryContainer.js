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
      return acc.concat(item);
    }, []),
    "createdAt"
  ).reverse();
};

const mapIntent = (intent, data) => {
  switch (intent) {
    case "global.createProject":
      return `Created project ${data.project.displayName}`;
    case "project.intent.grantPermission":
      return `Granted permission "${strings.permissions[data.intent.replace(/[.]/g, "_")] || data.intent}" to ${
        data.userId
      }`;
    case "project.createSubproject":
      return `Created workflow item ${data.subproject.displayName}`;
    case "subproject.close":
      return `Closed workflow item ???`;
    case "subproject.intent.grantPermission":
      return `Granted permission "${strings.permissions[data.intent.replace(/[.]/g, "_")] || data.intent}" to ${
        data.userId
      }`;
    default:
      console.log(intent);
      console.log(data);
      return "Intent not defined";
  }
};

class ProjectHistoryContainer extends Component {
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
    items: state.getIn(["detailview", "historyItems"]),
    show: state.getIn(["notifications", "showHistory"])
  };
};
const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(hideHistory())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistoryContainer);
