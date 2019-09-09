import { withStyles } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import { connect } from "react-redux";

import { getMissingViewPermissions, toJS } from "../../helper";
import strings from "../../localizeStrings";
import AssigneeSelection from "../Common/AssigneeSelection";
import ResourceAssignConfirmationDialog from "../Common/ResourceAssignConfirmationDialog";
import { fetchProjectPermissions } from "../Overview/actions";
import { executeConfirmedActions, fetchSubProjectPermissions } from "../SubProjects/actions";
import {
  assignWorkflowItem,
  fetchWorkflowItemPermissions,
  hideWorkflowitemConfirmationDialog,
  showWorkflowitemConfirmationDialog
} from "./actions";

const styles = {
  assigneeContainer: {
    width: "100%",
    cursor: "-webkit-grab"
  }
};

class WorkflowAssigneeContainer extends Component {
  assignWorkflow = (identityId, identityDisplayName) => {
    const {
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      workflowitemId,
      workflowitemDisplayName,
      permissions
    } = this.props;
    const project = { id: projectId, displayName: projectDisplayName };
    const subproject = { id: subprojectId, displayName: subprojectDisplayName };
    const workflowitem = { id: workflowitemId, displayName: workflowitemDisplayName };
    const missingViewPermissions = getMissingViewPermissions(
      permissions,
      identityId,
      project,
      subproject,
      workflowitem
    );
    const permittedToGrant =
      permissions.project["project.intent.grantPermission"].includes(this.props.assigner) &&
      permissions.subproject["subproject.intent.grantPermission"].includes(this.props.assigner) &&
      permissions.workflowitem["workflowitem.intent.grantPermission"].includes(this.props.assigner);
    if (missingViewPermissions.length !== 0) {
      const assignee = { id: identityId, displayName: identityDisplayName };
      this.props.showConfirmationDialog(workflowitem.id, missingViewPermissions, assignee, permittedToGrant);
    } else {
      this.props.assignWorkflow(projectId, subprojectId, workflowitemId, identityId);
    }
  };

  confirmDialog = () => {
    const {
      confirmation,
      projectId,
      subprojectId,
      workflowitemId,
      assignWorkflow,
      executeConfirmedActions,
      hideConfirmationDialog
    } = this.props;

    executeConfirmedActions(confirmation.actions, projectId, subprojectId);
    assignWorkflow(projectId, subprojectId, workflowitemId, confirmation.assignee.id);
    hideConfirmationDialog();
  };

  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.data.id === selectedId);
    return selectedWorkflowItem.data.assignee;
  };

  fetchPermissions = (projectId, subprojectId, workflowitemId, permissions) => {
    if (_isEmpty(permissions.project)) this.props.fetchProjectPermissions(projectId);
    if (_isEmpty(permissions.subproject)) this.props.fetchSubprojectPermissions(projectId, subprojectId);
    if (_isEmpty(permissions.workflowitem) || workflowitemId !== permissions.workflowitemId)
      this.props.fetchWorkflowitemPermissions(projectId, subprojectId, workflowitemId);
  };

  render() {
    const {
      projectId,
      subprojectId,
      workflowitemId,
      workflowItems,
      classes,
      users,
      title,
      disabled,
      workflowSortEnabled,
      status,
      confirmation,
      hideConfirmationDialog,
      permittedToGrant,
      permissions,
      isFetchingProjectPermissions,
      isFetchingSubprojectPermissions,
      isFetchingWorkflowitemPermissions
    } = this.props;
    const assignee = this.getWorkflowAssignee(workflowItems, workflowitemId);
    const isFetchingPermissions =
      isFetchingProjectPermissions || isFetchingSubprojectPermissions || isFetchingWorkflowitemPermissions;

    return (
      <div className={classes.assigneeContainer} data-test={"workflowitem-assignee"}>
        <AssigneeSelection
          assigneeId={assignee}
          disabled={isFetchingPermissions || disabled || workflowSortEnabled}
          users={users}
          title={title}
          assign={this.assignWorkflow}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          onOpen={() => this.fetchPermissions(projectId, subprojectId, workflowitemId, permissions)}
        />
        <ResourceAssignConfirmationDialog
          title={strings.confirmation.view_permissions_title}
          open={confirmation.visible && workflowitemId === confirmation.id}
          actions={confirmation.actions}
          assignee={confirmation.assignee}
          onConfirm={this.confirmDialog}
          onCancel={hideConfirmationDialog}
          permittedToGrant={permittedToGrant}
          resource={strings.common.workflowItem}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"]),
    permissions: state.getIn(["workflow", "permissions"]),
    confirmation: state.getIn(["workflow", "confirmation", "workflowitem"]),
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    subprojectId: state.getIn(["workflow", "id"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"]),
    permittedToGrant: state.getIn(["workflow", "permittedToGrant"]),
    assigner: state.getIn(["login", "id"]),
    isFetchingProjectPermissions: state.getIn(["workflow", "isFetchingProjectPermissions"]),
    isFetchingSubprojectPermissions: state.getIn(["workflow", "isFetchingSubprojectPermissions"]),
    isFetchingWorkflowitemPermissions: state.getIn(["workflow", "isFetchingWorkflowitemPermissions"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignWorkflow: (projectId, subProjectId, workflowId, identity) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, identity)),
    fetchProjectPermissions: pId => dispatch(fetchProjectPermissions(pId, true)),
    fetchSubprojectPermissions: (pId, sId) => dispatch(fetchSubProjectPermissions(pId, sId, true)),
    fetchWorkflowitemPermissions: (pId, sId, wId) => dispatch(fetchWorkflowItemPermissions(pId, sId, wId, true)),
    hideConfirmationDialog: () => dispatch(hideWorkflowitemConfirmationDialog()),
    showConfirmationDialog: (id, actions, assignee, permittedToGrant) =>
      dispatch(showWorkflowitemConfirmationDialog(id, actions, assignee, permittedToGrant)),
    executeConfirmedActions: (actions, pId, sId) => dispatch(executeConfirmedActions(actions, pId, sId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(WorkflowAssigneeContainer)));
