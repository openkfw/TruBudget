import React from "react";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import strings from "../../localizeStrings";
import Button from "@material-ui/core/Button";
import AutoComplete from "../Common/AutoComplete";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import NameIcon from "@material-ui/icons/AssignmentInd";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";

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
  const { groups, groupToAdd, storeGroupName, editMode, editId, addUser, hideEditDialog, editDialogShown, users, removeUserFromGroup, storeGroupId, classes } = props;
  const group = groups.find(group => group.groupId === editId);
  const addUserToGroup = userId => {
    addUser(group.groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(group.groupId, userId);
  };
  const { groupId, name, groupUsers } = groupToAdd;
  return (
    <DialogContent className={classes.content}>
      <div style={styles.textInputContainer}>
        <TextInputWithIcon
          style={styles.textInput}
          label={strings.common.id}
          value={groupId}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          id="id"
          onChange={event => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          style={styles.textInput}
          label={strings.common.name}
          value={name}
          id="name"
          error={false}
          disabled={editMode}
          icon={<OrgaIcon />}
          onChange={event => storeGroupName(event.target.value)}
        />
      </div>
      <AutoComplete
        users={users}
        selectedItems={group ? group.users : []}
        addToSelection={addUserToGroup}
        handleDelete={removeUser}
      />

    </DialogContent>
  );
};

export default withStyles(styles)(GroupEdit);
