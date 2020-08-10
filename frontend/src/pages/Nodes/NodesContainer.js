import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import { canViewNodesDashboard } from "../../permissions";
import NotAuthorized from "../Error/NotAuthorized";
import withInitialLoading from "../Loading/withInitialLoading";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import { approveNewNodeForExistingOrganization, approveNewOrganization, fetchNodes } from "./actions";
import Nodes from "./Nodes";

class NodesContainer extends Component {
  componentDidMount() {
    this.props.fetchNodes();
  }

  render() {
    if (canViewNodesDashboard(this.props.allowedIntents)) {
      return <Nodes {...this.props} />;
    }
    return <NotAuthorized />;
  }
}

const mapStateToProps = state => {
  return {
    nodes: state.getIn(["nodes", "nodes"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    isDataLoading: state.getIn(["loading", "loadingVisible"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchNodes: () => dispatch(fetchNodes(true)),
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    approveNewOrganization: organization => dispatch(approveNewOrganization(organization)),
    approveNewNodeForExistingOrganization: address => dispatch(approveNewNodeForExistingOrganization(address))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(NodesContainer)));
