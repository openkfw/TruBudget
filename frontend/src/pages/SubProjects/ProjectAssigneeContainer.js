import _isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import { connect } from "react-redux";

import { getMissingViewPermissions, toJS } from "../../helper";
import strings from "../../localizeStrings";
import AssigneeSelection from "../Common/AssigneeSelection";
import ResourceAssignConfirmationDialog from "../Common/ResourceAssignConfirmationDialog";
import { fetchProjectPermissions } from "../Overview/actions";
import {
  assignProject,
  executeConfirmedActions,
  hideProjectConfirmationDialog,
  showProjectConfirmationDialog
} from "./actions";

class ProjectAssigneeContainer extends Component {
  assignProject = (identityId, identityDisplayName) => {
    const project = {
      id: this.props.projectId,
      displayName: this.props.projectDisplayName
    };
    const permissions = {
      project: this.props.permissions.project
    };
    const missingViewPermissions = getMissingViewPermissions(permissions, identityId, project);
    const permittedToGrant = permissions.project["project.intent.grantPermission"].includes(this.props.assigner);
    if (missingViewPermissions.length !== 0) {
      const assignee = { id: identityId, displayName: identityDisplayName };
      this.props.showConfirmationDialog(missingViewPermissions, assignee, permittedToGrant);
    } else {
      this.props.assignProject(this.props.projectId, identityId);
    }
  };

  confirmDialog = () => {
    this.props.executeConfirmedActions(this.props.confirmation.actions);
    this.props.assignProject(this.props.projectId, this.props.confirmation.assignee.id);
    this.props.hideConfirmationDialog();
  };

  render() {
    const {
      projectId,
      assignee,
      users,
      disabled,
      title,
      fetchProjectPermissions,
      confirmation,
      hideConfirmationDialog,
      permittedToGrant,
      permissions,
      isFetchingPermissions
    } = this.props;

    return (
      <React.Fragment>
        <AssigneeSelection
          assigneeId={assignee}
          users={users}
          disabled={isFetchingPermissions || disabled}
          title={title}
          assign={this.assignProject}
          onOpen={() => (_isEmpty(permissions.project) ? fetchProjectPermissions(projectId) : null)}
        />
        <ResourceAssignConfirmationDialog
          title={strings.confirmation.view_permissions_title}
          open={confirmation.visible}
          actions={confirmation.actions}
          assignee={confirmation.assignee}
          onConfirm={this.confirmDialog}
          onCancel={hideConfirmationDialog}
          permittedToGrant={permittedToGrant}
          resource={strings.common.project}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["detailview", "permissions"]),
    projectId: state.getIn(["detailview", "id"]),
    projectDisplayName: state.getIn(["detailview", "projectName"]),
    confirmation: state.getIn(["detailview", "confirmation"]),
    permittedToGrant: state.getIn(["detailview", "permittedToGrant"]),
    assigner: state.getIn(["login", "id"]),
    isFetchingPermissions: state.getIn(["detailview", "isFetchingProjectPermissions"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchProjectPermissions: pId => dispatch(fetchProjectPermissions(pId, true)),
    assignProject: (projectId, identity) => dispatch(assignProject(projectId, identity)),
    hideConfirmationDialog: () => dispatch(hideProjectConfirmationDialog()),
    showConfirmationDialog: (actions, assignee, permittedToGrant) =>
      dispatch(showProjectConfirmationDialog(actions, assignee, permittedToGrant)),
    executeConfirmedActions: (actions, pId) => dispatch(executeConfirmedActions(actions, pId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectAssigneeContainer));
