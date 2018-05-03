import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { hideProjectAssignees } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class ProjectAssigneeContainer extends Component {
  render() {
    return <AssigneeDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["detailview", "showProjectAssignees"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideProjectAssignees())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectAssigneeContainer)));
