import { withStyles } from "@material-ui/core";
import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import {
  assignWorkflowItem,
  disableWorkflowEdit,
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  hideWorkflowItemPreview,
  resetSucceededWorkflowitems,
  revokeWorkflowItemPermission,
  showWorkflowItemPreview,
  storePermissions,
  storeWorkflowItemsAssignee
} from "./actions";
import WorkflowEditDrawer from "./WorkflowEditDrawer";
import WorkflowPreviewDialog from "./WorkflowPreviewDialog";

const styles = {};

class WorkflowBatchEditContainer extends Component {
  render() {
    return (
      <div>
        <WorkflowPreviewDialog {...this.props} />
        <WorkflowEditDrawer {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    previewDialogShown: state.getIn(["workflow", "previewDialogShown"]),
    dialogTitle: state.getIn(["workflow", "dialogTitle"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"]),
    tempDrawerPermissions: state.getIn(["workflow", "tempDrawerPermissions"]),
    tempDrawerAssignee: state.getIn(["workflow", "tempDrawerAssignee"]),
    succeededWorkflowAssign: state.getIn(["workflow", "succeededWorkflowAssign"]),
    succeededWorkflowGrant: state.getIn(["workflow", "succeededWorkflowGrant"]),
    currentWorkflowitemPermissions: state.getIn(["workflow", "permissions"]),
    permissions: state.getIn(["workflow", "permissions"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideWorkflowItemPreview: () => dispatch(hideWorkflowItemPreview()),
    grantWorkflowItemPermission: (pId, sId, wId, permission, user) =>
      dispatch(grantWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    assignWorkflow: (projectId, subProjectId, workflowId, identity) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, identity)),
    resetSucceededWorkflowitems: () => dispatch(resetSucceededWorkflowitems()),
    revokeWorkflowItemPermission: (pId, sId, wId, permission, user) =>
      dispatch(revokeWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    fetchWorkflowItemPermissions: (pId, wId, showLoading) =>
      dispatch(fetchWorkflowItemPermissions(pId, wId, showLoading)),
    storeAssignee: assignee => dispatch(storeWorkflowItemsAssignee(assignee)),
    storePermissions: permissions => dispatch(storePermissions(permissions)),
    showWorkflowItemPreview: () => dispatch(showWorkflowItemPreview()),
    disableWorkflowEdit: () => dispatch(disableWorkflowEdit())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withInitialLoading(toJS(withStyles(styles)(WorkflowBatchEditContainer)))
);
