import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import strings from "../../localizeStrings";
import Button from "@material-ui/core/Button";
import AutoComplete from "../Common/AutoComplete";

const GroupEdit = props => {
  const { groups, editId, addUser, hideEditDialog, show, users, removeUserFromGroup } = props;
  const group = groups.find(group => group.groupId === editId);
  const addUserToGroup = userId => {
    addUser(group.groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(group.groupId, userId);
  };

  return (
    <Dialog open={show} onClose={hideEditDialog}>
      <DialogTitle>{"Add Users"}</DialogTitle>
      <DialogContent styles={{ width: 300, maxWidth: "50" }}>
        <AutoComplete
          users={users}
          selectedItems={group ? group.users : []}
          addToSelection={addUserToGroup}
          handleDelete={removeUser}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={hideEditDialog}>
          {strings.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default GroupEdit;
