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
import { assignSubproject, hideSubprojectConfirmationDialog, showSubprojectConfirmationDialog } from "./actions";

const styles = {};

class SubProjectAssigneeContainer extends Component {
  assignSubproject = (identityId, identityDisplayName) => {
    const { projectId, projectDisplayName, subprojectId, subprojectDisplayName } = this.props;
    const project = { id: projectId, displayName: projectDisplayName };
    const subproject = { id: subprojectId, displayName: subprojectDisplayName };
    const permissions = {
      project: this.props.permissions.project,
      subproject: this.props.permissions.subproject
    };
    const missingViewPermissions = getMissingViewPermissions(permissions, identityId, project, subproject);
    const permittedToGrant =
      permissions.project["project.intent.grantPermission"].includes(this.props.assigner) &&
      permissions.subproject["subproject.intent.grantPermission"].includes(this.props.assigner);
    if (missingViewPermissions.length !== 0) {
      const assignee = {
        id: identityId,
        displayName: identityDisplayName
      };
      this.props.showConfirmationDialog(missingViewPermissions, assignee, permittedToGrant);
    } else {
      this.props.assignSubproject(projectId, subprojectId, identityId);
    }
  };

  confirmDialog = () => {
    const {
      confirmation,
      projectId,
      subprojectId,
      assignSubproject,
      executeConfirmedActions,
      hideConfirmationDialog
    } = this.props;

    executeConfirmedActions(confirmation.actions, projectId);
    assignSubproject(projectId, subprojectId, confirmation.assignee.id);
    hideConfirmationDialog();
  };

  fetchPermissions = (projectId, subprojectId) => {
    this.props.fetchProjectPermissions(projectId);
    this.props.fetchSubprojectPermissions(projectId, subprojectId);
  };

  render() {
    const {
      projectId,
      subprojectId,
      assignee,
      disabled,
      users,
      confirmation,
      hideConfirmationDialog,
      permittedToGrant,
      permissions,
      isFetchingProjectPermissions,
      isFetchingSubprojectPermissions
    } = this.props;
    const permissionsFetched = !_isEmpty(permissions.project) && !_isEmpty(permissions.subproject);
    const isFetchingPermissions = isFetchingProjectPermissions || isFetchingSubprojectPermissions;

    return (
      <React.Fragment>
        <AssigneeSelection
          assigneeId={assignee}
          disabled={isFetchingPermissions || disabled}
          users={users}
          assign={this.assignSubproject}
          onOpen={() => (!permissionsFetched ? this.fetchPermissions(projectId, subprojectId) : null)}
        />
        <ResourceAssignConfirmationDialog
          title={strings.confirmation.view_permissions_title}
          open={confirmation.visible}
          actions={confirmation.actions}
          assignee={confirmation.assignee}
          onConfirm={this.confirmDialog}
          onCancel={hideConfirmationDialog}
          permittedToGrant={permittedToGrant}
          resource={strings.common.subproject}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions"]),
    confirmation: state.getIn(["workflow", "confirmation", "subproject"]),
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    subprojectId: state.getIn(["workflow", "id"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    permittedToGrant: state.getIn(["workflow", "permittedToGrant"]),
    assigner: state.getIn(["login", "id"]),
    isFetchingProjectPermissions: state.getIn(["workflow", "isFetchingProjectPermissions"]),
    isFetchingSubprojectPermissions: state.getIn(["workflow", "isFetchingSubprojectPermissions"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchProjectPermissions: pId => dispatch(fetchProjectPermissions(pId, true)),
    fetchSubprojectPermissions: (pId, sId) => dispatch(fetchSubProjectPermissions(pId, sId, true)),
    assignSubproject: (projectId, subprojectId, identity) =>
      dispatch(assignSubproject(projectId, subprojectId, identity)),
    hideConfirmationDialog: () => dispatch(hideSubprojectConfirmationDialog()),
    showConfirmationDialog: (actions, assignee, permittedToGrant) =>
      dispatch(showSubprojectConfirmationDialog(actions, assignee, permittedToGrant)),
    executeConfirmedActions: (actions, pId, sId) => dispatch(executeConfirmedActions(actions, pId, sId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(SubProjectAssigneeContainer)));
