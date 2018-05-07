import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import Users from "./Users";

class UsersContainer extends Component {
  render() {
    return <Users {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["detailview", "showProjectAssignees"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UsersContainer)));
