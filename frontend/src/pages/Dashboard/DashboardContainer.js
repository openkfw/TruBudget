import React, { Component } from "react";
import { connect } from "react-redux";

import { fetchNodeInformation } from "./actions";
import Dashboard from "./Dashboard";
import globalStyles from "../../styles.js";

class DashboardContainer extends Component {
  componentDidMount() {
    this.props.fetchNodeInformation();
  }
  render() {
    return (
      <div style={globalStyles.innerContainer}>
        <Dashboard {...this.props} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNodeInformation: () => dispatch(fetchNodeInformation())
  };
};

const mapStateToProps = state => {
  return {
    nodeInformation: state.getIn(["dashboard", "nodeInformation"]).toJS()
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
