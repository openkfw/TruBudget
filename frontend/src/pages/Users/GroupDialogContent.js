import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import NameIcon from "@material-ui/icons/AssignmentInd";
import InfoIcon from "@material-ui/icons/Info";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import React from "react";

import strings from "../../localizeStrings";
import UserSelection from "../Common/UserSelection";
import TextInputWithIcon from "../Common/TextInputWithIcon";

const styles = {
  container: {},
  customWidth: {},
  createButton: {},
  createButtonContainer: {},
  textInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textInput: {
    width: "50%"
  },
  divider: {
    marginTop: 20,
    marginBottom: 20
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  },
  info: {
    display: "flex",
    paddingRight: 20,
    marginLeft: 10,
    marginBottom: 20
  }
};

const GroupDialogContent = ({
  enabledUsers,
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
      <span className={classes.info}>
        <InfoIcon className={classes.infoIcon} />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={editMode ? groupId : strings.common.id}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          data-test="groupid"
          onChange={event => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          className={classes.textInput}
          label={editMode ? displayName : strings.common.name}
          data-test="groupname"
          error={false}
          disabled={editMode}
          icon={<OrgaIcon />}
          onChange={event => storeGroupName(event.target.value)}
        />
      </div>
      <div>
        <UserSelection
          users={enabledUsers.filter(user => user.isGroup !== true)}
          addToSelection={editMode ? addUserToGroup : addInitialUserToGroup}
          selectedItems={groupUsers}
          handleDelete={editMode ? removeUser : removeInitialUserFromGroup}
        />
      </div>
    </div>
  );
};

export default withStyles(styles)(GroupDialogContent);
