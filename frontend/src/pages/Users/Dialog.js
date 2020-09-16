import _isEmpty from "lodash/isEmpty";
import React from "react";

import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import GlobalPermissions from "./GlobalPermissions";
import GroupDialogContent from "./GroupDialogContent";
import UserDialogContent from "./UserDialogContent";

const createActions = (permissions, temporayPermissions) => {
  const actions = [];
  Object.keys(temporayPermissions).forEach(key => {
    const permissionIds = permissions[key] || [];
    const temporaryPermissionIds = temporayPermissions[key];

    const revokeIds = permissionIds.filter(id => !temporaryPermissionIds.includes(id));
    if (revokeIds.length > 0) actions.push({ type: "revoke", permission: key, userIds: revokeIds });
    const grantIds = temporaryPermissionIds.filter(id => !permissionIds.includes(id));
    if (grantIds.length > 0) actions.push({ type: "grant", permission: key, userIds: grantIds });
  });

  return actions;
};

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
    enabledUsers,
    disabledUsers,
    loggedInUserId,
    globalPermissions,
    temporaryGlobalPermissions,
    addTemporaryPermission,
    removeTemporaryPermission,
    permissionsExpanded,
    allowedIntents,
    grantGlobalPermission,
    revokeGlobalPermission,
    setUsernameInvalid
  } = props;
  const users = [...enabledUsers, ...disabledUsers];
  const { username, password, displayName, hasAdminPermissions } = userToAdd;
  let title = "";

  const { groupId, name: groupName, groupUsers } = groupToAdd;
  let steps, handleSubmitFunc;
  switch (dialogType) {
    case "addUser":
      steps = [
        {
          title: strings.users.add_user,
          content: <UserDialogContent {...props} user={userToAdd} />,
          nextDisabled: _isEmpty(username) || _isEmpty(password) || _isEmpty(displayName)
        }
      ];
      handleSubmitFunc = () => {
        if (username !== "root") {
          setUsernameInvalid(false);
          createUser(displayName, userOrganization, username, password);
          if (hasAdminPermissions) {
            grantAllUserPermissions(username);
          }
          hideDashboardDialog();
          storeSnackbarMessage(strings.users.user_created);
          showSnackbar();
        } else {
          setUsernameInvalid(true);
        }
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
    case "editUserPermissions":
      const userToEditPermissions = users.find(user => user.id === editId);
      steps = [
        {
          title: `${strings.users.edit_permissions_for} ${userToEditPermissions.displayName}`,
          content: (
            <GlobalPermissions
              grantGlobalPermission={addTemporaryPermission}
              revokeGlobalPermission={removeTemporaryPermission}
              resourceId={userToEditPermissions.id}
              globalPermissions={temporaryGlobalPermissions}
              allowedIntents={allowedIntents}
              loggedInUserId={loggedInUserId}
            />
          ),
          nextDisabled: false,
          hideCancel: false,
          submitButtonText: strings.common.submit
        }
      ];
      handleSubmitFunc = () => {
        const actions = createActions(globalPermissions, temporaryGlobalPermissions);
        actions.forEach(action => {
          if (action.type === "grant") {
            action.userIds.forEach(user => {
              grantGlobalPermission(userToEditPermissions.id, action.permission);
            });
          } else if (action.type === "revoke") {
            action.userIds.forEach(user => {
              revokeGlobalPermission(userToEditPermissions.id, action.permission);
            });
          } else console.error("Not a recognized action", action.type);
        });
        hideDashboardDialog();
      };

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
              globalPermissions={temporaryGlobalPermissions}
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
      title={title !== "" ? title : steps[0].title}
      numberOfSteps={steps.length}
      onDialogCancel={props.hideDashboardDialog}
      dialogShown={dashboardDialogShown}
      handleSubmit={() => handleSubmitFunc()}
      {...props}
    />
  );
};

export default Dialog;
