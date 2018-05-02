import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneesDialog from "../Common/AssigneesDialog";
import { hideProjectAssignees } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class ProjectAssigneesContainer extends Component {
  render() {
    return <AssigneesDialog {...this.props} />;
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

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectAssigneesContainer)));
