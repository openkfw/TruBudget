import _isEmpty from "lodash/isEmpty";
import React from "react";

import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import GlobalPermissions from "./GlobalPermissions";
import GroupDialogContent from "./GroupDialogContent";
import UserDialogContent from "./UserDialogContent";

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
    loggedInUserId,
    globalPermissions,
    permissionsExpanded,
    allowedIntents,
    grantGlobalPermission,
    revokeGlobalPermission,
    wrongPasswordGiven,
    userPassword,
    newPassword,
    newPasswordsMatch,
    storeUserPassword,
    storeNewPasswordsMatch,
    newPasswordConfirmation,
    storeNewPassword,
    storeNewPasswordConfirmation,
    checkAndChangeUserPassword,
    setUsernameInvalid
  } = props;
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
              grantGlobalPermission={grantGlobalPermission}
              revokeGlobalPermission={revokeGlobalPermission}
              resourceId={userToEditPermissions.id}
              globalPermissions={globalPermissions}
              permissionsExpanded={permissionsExpanded}
              allowedIntents={allowedIntents}
              loggedInUserId={loggedInUserId}
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
        steps = [
          {
            title: `${strings.users.edit_permissions_for} ${group.displayName}`,
            content: (
              <div>
                <GlobalPermissions
                  grantGlobalPermission={grantGlobalPermission}
                  revokeGlobalPermission={revokeGlobalPermission}
                  resourceId={group.groupId}
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
