import React from "react";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import strings from "../../localizeStrings";
import Button from "@material-ui/core/Button";
import AutoComplete from "../Common/AutoComplete";
import GroupEdit from "../Groups/GroupEdit";
import GroupCreate from "../Groups/GroupCreate";
import UserCreate from "./UserCreate";

const styles = {
  paper: {
    overflowY: "visible"
  },
  content: {
    width: 400,
    overflowY: "visible"
  }
};
const DialogWrapper = props => {
  const { content, groups, editId, addUser, hideEditDialog, editDialogShown, users, removeUserFromGroup, classes } = props;
  const group = groups.find(group => group.groupId === editId);
  const addUserToGroup = userId => {
    addUser(group.groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(group.groupId, userId);
  };
  return (
    <Dialog open={editDialogShown} classes={{ paperScrollPaper: classes.paper }} onClose={hideEditDialog}>
      {/* <DialogTitle>{strings.groupDashboard.add_users}</DialogTitle> */}
      <DialogContent className={classes.content}>

        {content === "UserCreate" ? (
          <UserCreate {...props} />
        ) : null}
        {content === "GroupCreate" ? (
          <GroupCreate {...props} />
        ) : null}
        {content === "GroupEdit" ? (
          <GroupEdit {...props} />
        ) : null}

      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={hideEditDialog}>
          {strings.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(DialogWrapper);
