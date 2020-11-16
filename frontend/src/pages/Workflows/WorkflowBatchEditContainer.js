import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import {
  assignWorkflowItem,
  disableWorkflowEdit,
  hideWorkflowItemPreview,
  resetSucceededWorkflowitems,
  showWorkflowItemPreview,
  storePermissions,
  storeWorkflowItemBatchAssignee,
  submitBatchForWorkflow
} from "./actions";
import WorkflowEditDrawer from "./WorkflowEditDrawer";
import WorkflowPreviewDialog from "./WorkflowPreviewDialog";

class WorkflowBatchEditContainer extends Component {
  render() {
    return (
      <div>
        {this.props.previewDialogShown === true ? <WorkflowPreviewDialog {...this.props} /> : null}
        <WorkflowEditDrawer {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    previewDialogShown: state.getIn(["workflow", "previewDialogShown"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"]),
    tempDrawerPermissions: state.getIn(["workflow", "tempDrawerPermissions"]),
    tempDrawerAssignee: state.getIn(["workflow", "tempDrawerAssignee"]),
    currentWorkflowitemPermissions: state.getIn(["workflow", "permissions"]),
    permissions: state.getIn(["workflow", "permissions", "workflowitem"]),
    users: state.getIn(["login", "enabledUsers"]),
    workflowActions: state.getIn(["workflow", "workflowActions"]),
    submittedWorkflowItems: state.getIn(["workflow", "submittedWorkflowItems"]),
    failedWorkflowItem: state.getIn(["workflow", "failedWorkflowItem"]),
    submitDone: state.getIn(["workflow", "submitDone"]),
    submitInProgress: state.getIn(["workflow", "submitInProgress"]),
    myself: state.getIn(["login", "id"]),
    subprojectId: state.getIn(["workflow", "id"]),
    hasSubprojectValidator: state.getIn(["workflow", "hasSubprojectValidator"]),
    subprojectValidator: state.getIn(["workflow", "subprojectValidator"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideWorkflowItemPreview: () => dispatch(hideWorkflowItemPreview()),
    assignWorkflow: (projectId, subProjectId, workflowId, identity) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, identity)),
    resetSucceededWorkflowitems: () => dispatch(resetSucceededWorkflowitems()),
    storeAssignee: assignee => dispatch(storeWorkflowItemBatchAssignee(assignee)),
    storePermissions: permissions => dispatch(storePermissions(permissions)),
    showWorkflowItemPreview: (pId, subprojectId, resources, assignee, permissions) =>
      dispatch(showWorkflowItemPreview(pId, subprojectId, resources, assignee, permissions)),
    disableWorkflowEdit: () => dispatch(disableWorkflowEdit()),
    editWorkflowitems: (pId, subpId, actions) => dispatch(submitBatchForWorkflow(pId, subpId, actions, false))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowBatchEditContainer)));
