import React from "react";

import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";
import { withStyles } from "@material-ui/core";

import strings from "../../localizeStrings";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import AutoComplete from "../Common/AutoComplete";

const styles = {
  textInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textInput: {
    width: "50%"
  }
};

const GroupCreate = ({
  users,
  groupToAdd,
  storeGroupId,
  storeGroupName,
  addInitialUserToGroup,
  editMode,
  removeInitialUserFromGroup,
  removeUserFromGroup,
  addUser,
  classes
}) => {
  const { groupId, displayName, groupUsers } = groupToAdd;

  const addUserToGroup = userId => {
    addUser(groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(groupId, userId);
  };
  return (
    <div>
      <div className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={editMode ? groupId : strings.common.id}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          id="id"
          onChange={event => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          className={classes.textInput}
          label={editMode ? displayName : strings.common.name}
          id="name"
          error={false}
          disabled={editMode}
          icon={<OrgaIcon />}
          onChange={event => storeGroupName(event.target.value)}
        />
      </div>
      <div>
        <AutoComplete
          users={users.filter(user => user.isGroup !== true)}
          addToSelection={editMode ? addUserToGroup : addInitialUserToGroup}
          selectedItems={groupUsers}
          handleDelete={editMode ? removeUser : removeInitialUserFromGroup}
        />
      </div>
    </div>
  );
};

export default withStyles(styles)(GroupCreate);
