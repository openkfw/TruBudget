import React from "react";

import NameIcon from "@mui/icons-material/AssignmentInd";
import InfoIcon from "@mui/icons-material/Info";
import OrgaIcon from "@mui/icons-material/StoreMallDirectory";
import { Typography } from "@mui/material";

import strings from "../../localizeStrings";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import UserSelection from "../Common/UserSelection";

import "./GroupDialogContent.scss";

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
      <span className="info">
        <InfoIcon className="info-icon" />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div className="group-dialog-container">
        <TextInputWithIcon
          className="group-dialog-input"
          label={editMode ? groupId : strings.common.id}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          data-test="groupid"
          onChange={(event) => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          className="group-dialog-input"
          label={editMode ? displayName : strings.common.name}
          data-test="groupname"
          error={false}
          disabled={editMode}
          icon={<OrgaIcon />}
          onChange={(event) => storeGroupName(event.target.value)}
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
