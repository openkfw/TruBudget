import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import UserDialogContent from "./UserDialogContent";
import GroupDialogContent from "./GroupDialogContent";
import GlobalPermissions from "./GlobalPermissions";

const Dialog = props => {
  const {
    dashboardDialogShown,
    dialogType,
    editId,
    groups,
    userToAdd,
    groupToAdd,
    createUser,
    organization: userOrganization,
    hideDashboardDialog,
    createUserGroup,
    storeSnackbarMessage,
    showSnackbar,
    grantAllUserPermissions,
    users,
    globalPermissions,
    permissionsExpanded,
    allowedIntents,
    grantGlobalPermission,
    revokeGlobalPermission
  } = props;
  const { username, password, displayName, hasAdminPermissions } = userToAdd;

  const { groupId, name: groupName, groupUsers } = groupToAdd;
  let steps, handleSubmitFunc;
  switch (dialogType) {
    case "addUser":
      steps = [
        {
          title: strings.users.add_user,
          content: <UserDialogContent {...props} />,
          nextDisabled: _isEmpty(username) || _isEmpty(password) || _isEmpty(displayName)
        }
      ];
      handleSubmitFunc = () => {
        createUser(displayName, userOrganization, username, password);
        if (hasAdminPermissions) {
          grantAllUserPermissions(username);
        }
        hideDashboardDialog();
        storeSnackbarMessage(strings.users.user_created);
        showSnackbar();
      };
      break;
    case "addGroup":
      steps = [
        {
          title: strings.users.add_group,
          content: <GroupDialogContent {...props} />,
          nextDisabled: _isEmpty(groupId) || _isEmpty(groupName) || _isEmpty(groupUsers)
        }
      ];
      handleSubmitFunc = () => {
        createUserGroup(groupId, groupName, groupUsers);
        hideDashboardDialog();
        storeSnackbarMessage(strings.users.group_created);
        showSnackbar();
      };
      break;
    case "editUser":
      const user = users.find(user => user.id === editId);
      const userToEdit = {
        username: user.id,
        organization: user.organization,
        displayName: user.displayName
      };
      steps = [
        {
          title: `${strings.users.edit_permissions_for} ${userToEdit.displayName}`,
          content: (
            <GlobalPermissions
              grantGlobalPermission={grantGlobalPermission}
              revokeGlobalPermission={revokeGlobalPermission}
              resourceId={userToEdit.username}
              globalPermissions={globalPermissions}
              permissionsExpanded={permissionsExpanded}
              allowedIntents={allowedIntents}
            />
          ),
          nextDisabled: false,
          hideCancel: true,
          submitButtonText: strings.common.done
        }
      ];
      handleSubmitFunc = () => {
        hideDashboardDialog();
      };

      break;
    case "editGroupPermissions":
      {
        const group = groups.find(group => group.groupId === editId);
        const groupToEdit = {
          groupId: group.groupId,
          displayName: group.displayName,
          groupUsers: group.users
        };
        steps = [
          {
            title: `${strings.users.edit_permissions_for} ${groupToEdit.displayName}`,
            content: (
              <div>
                <GlobalPermissions
                  grantGlobalPermission={grantGlobalPermission}
                  revokeGlobalPermission={revokeGlobalPermission}
                  resourceId={groupToEdit.groupId}
                  globalPermissions={globalPermissions}
                  allowedIntents={allowedIntents}
                  permissionsExpanded={permissionsExpanded}
                />
              </div>
            ),
            nextDisabled: false,
            hideCancel: true,
            submitButtonText: strings.common.done
          }
        ];
        handleSubmitFunc = () => {
          hideDashboardDialog();
        };
      }
      break;
    case "editGroup":
      const group = groups.find(group => group.groupId === editId);
      const groupToEdit = {
        groupId: group.groupId,
        displayName: group.displayName,
        groupUsers: group.users
      };
      steps = [
        {
          title: strings.users.edit_group,
          content: (
            <GroupDialogContent
              {...props}
              groupToAdd={groupToEdit}
              editMode={true}
              allowedIntents={allowedIntents}
              globalPermissions={globalPermissions}
              permissionsExpanded={permissionsExpanded}
            />
          ),
          nextDisabled: false,
          hideCancel: true,
          submitButtonText: strings.common.done
        }
      ];
      handleSubmitFunc = () => {
        hideDashboardDialog();
      };

      break;

    default:
      steps = [{ title: "no content" }];
      break;
  }

  return (
    <CreationDialog
      steps={steps}
      title={steps[0].title}
      numberOfSteps={steps.length}
      onDialogCancel={props.hideDashboardDialog}
      dialogShown={dashboardDialogShown}
      handleSubmit={() => handleSubmitFunc()}
      {...props}
    />
  );
};

export default Dialog;
