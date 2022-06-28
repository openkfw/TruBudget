import { Typography } from "@mui/material";
import NameIcon from "@mui/icons-material/AssignmentInd";
import InfoIcon from "@mui/icons-material/Info";
import OrgaIcon from "@mui/icons-material/StoreMallDirectory";
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
  group,
  storeGroupId,
  storeGroupName,
  addInitialUserToGroup,
  editMode,
  removeInitialUserFromGroup,
  removeUsers,
  addUsers
}) => {
  const { groupId, displayName, groupUsers } = group;
  return (
    <div>
      <span style={styles.info}>
        <InfoIcon style={styles.infoIcon} />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div style={styles.textInputContainer}>
        <TextInputWithIcon
          style={styles.textInput}
          label={editMode ? groupId : strings.common.id}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          data-test="groupid"
          onChange={event => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          style={styles.textInput}
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
          users={enabledUsers}
          addToSelection={editMode ? addUsers : addInitialUserToGroup}
          selectedItems={groupUsers}
          handleDelete={editMode ? removeUsers : removeInitialUserFromGroup}
        />
      </div>
    </div>
  );
};

export default GroupDialogContent;
