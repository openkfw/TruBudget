import React from "react";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import "./UsersGroupsEmptyStates.scss";

// Source of images: https://undraw.co/illustrations
// selected color code: #53BBFE

const EnabledUserEmptyState = () => {
  return (
    <Paper className="paper padded">
      <img
        src="images-for-empty-state/enabled-users-table-empty-state.png"
        alt={strings.common.no_users}
        width="505vw"
      />
      <Typography variant="subtitle1" className="subtitle">
        {strings.common.no_users}
      </Typography>
      <Typography variant="caption" className="caption">
        {strings.common.no_users_text}
      </Typography>
      <br />
    </Paper>
  );
};

const DisabledUserEmptyState = () => {
  return (
    <Paper className="paper">
      <img
        src="images-for-empty-state/disabled-users-table-empty-state.png"
        alt={strings.common.no_users}
        width="505vw"
      />
      <Typography variant="subtitle1" className="subtitle">
        {strings.common.no_disabled_users}
      </Typography>
      <br />
    </Paper>
  );
};

const UserGroupsEmptyState = () => {
  return (
    <Paper className="paper padded">
      <img
        src="images-for-empty-state/users-group-table-empty-state.png"
        alt={strings.common.no_groups}
        width="597vw"
      />
      <Typography variant="subtitle1" className="subtitle">
        {strings.common.no_groups}
      </Typography>
      <Typography variant="caption" className="caption">
        {strings.common.no_groups_text}
      </Typography>
      <br />
    </Paper>
  );
};

export { EnabledUserEmptyState, DisabledUserEmptyState, UserGroupsEmptyState };
