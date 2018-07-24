import React from "react";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import strings from "../../localizeStrings";
import Button from "@material-ui/core/Button";
import AutoComplete from "../Common/AutoComplete";

const styles = {
  paper: {
    overflowY: "visible"
  },
  content: {
    width: 400,
    overflowY: "visible"
  }
};
const GroupEdit = props => {
  const { groups, editId, addUser, hideEditDialog, show, users, removeUserFromGroup, classes } = props;
  const group = groups.find(group => group.groupId === editId);
  const addUserToGroup = userId => {
    addUser(group.groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(group.groupId, userId);
  };

  return (
    <Dialog open={show} classes={{ paperScrollPaper: classes.paper }} onClose={hideEditDialog}>
      <DialogTitle>{strings.groupDashboard.add_users}</DialogTitle>
      <DialogContent className={classes.content}>
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

export default withStyles(styles)(GroupEdit);
