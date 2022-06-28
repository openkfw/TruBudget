import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import SingleSelection from "../Common/SingleSelection";
import { assignSubproject } from "./actions";

class SubProjectAssigneeContainer extends Component {
  render() {
    const {
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      assignee,
      disabled,
      users,
      assignSubproject
    } = this.props;

    return (
      <SingleSelection
        selectId={assignee}
        selectableItems={users}
        disabled={disabled}
        onSelect={(assigneeId, assigneeDisplayName) =>
          assignSubproject(
            projectId,
            projectDisplayName,
            subprojectId,
            subprojectDisplayName,
            assigneeId,
            assigneeDisplayName
          )
        }
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    subprojectId: state.getIn(["workflow", "id"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignSubproject: (
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      assigneeId,
      assigneeDisplayName
    ) =>
      dispatch(
        assignSubproject(
          projectId,
          projectDisplayName,
          subprojectId,
          subprojectDisplayName,
          assigneeId,
          assigneeDisplayName
        )
      )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectAssigneeContainer));
