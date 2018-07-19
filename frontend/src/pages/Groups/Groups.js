import React from "react";
import { withStyles } from "../../../node_modules/@material-ui/core";
import GroupCreate from "./GroupCreate";
import GroupTable from "./GroupTable";
import GroupEdit from "./GroupEdit";

const styles = {};
const Groups = props => {
  const {
    users,
    groups,
    groupToAdd,
    storeGroupId,
    storeGroupName,
    addInitialUserToGroup,
    createUserGroup,
    editMode,
    showSnackbar,
    storeSnackbarMessage,
    editDialogShown,
    showEditDialog,
    editId,
    addUser,
    hideEditDialog,
    removeUserFromGroup,
    removeInitialUserFromGroup
  } = props;
  return (
    <div>
      <GroupCreate
        users={users}
        groupToAdd={groupToAdd}
        storeGroupId={storeGroupId}
        storeGroupName={storeGroupName}
        addInitialUserToGroup={addInitialUserToGroup}
        removeInitialUserFromGroup={removeInitialUserFromGroup}
        createUserGroup={createUserGroup}
        editMode={editMode}
        showSnackbar={showSnackbar}
        storeSnackbarMessage={storeSnackbarMessage}
      />
      <GroupTable groups={groups} showEditDialog={showEditDialog} />
      <GroupEdit
        show={editDialogShown}
        editId={editId}
        groups={groups}
        users={users}
        addUser={addUser}
        hideEditDialog={hideEditDialog}
        removeUserFromGroup={removeUserFromGroup}
      />
    </div>
  );
};
export default withStyles(styles)(Groups);
