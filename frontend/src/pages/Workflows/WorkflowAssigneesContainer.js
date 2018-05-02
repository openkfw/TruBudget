import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneesDialog from "../Common/AssigneesDialog";
import { hideWorkflowAssignees } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class WorkflowAssigneesContainer extends Component {
  render() {
    return <AssigneesDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["workflow", "showWorkflowAssignees"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideWorkflowAssignees())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowAssigneesContainer)));
