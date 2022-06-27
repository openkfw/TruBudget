import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";
import strings from "../../localizeStrings";

const styles = {
  subtitle: {
    color: theme => theme.palette.grey.dark
  },
  caption: {
    color: theme => theme.palette.grey.main
  }
};

// Source of images: https://undraw.co/illustrations
// selected color code: #53BBFE

const EnabledUserEmptyState = props => {
  return (
    <Paper style={{ textAlign: "center" }}>
      <img
        src="images-for-empty-state/enabled-users-table-empty-state.png"
        alt={strings.common.no_users}
        width="505vw"
      />
      <Typography variant="subtitle1" style={styles.subtitle}>
        {strings.common.no_users}
      </Typography>
      <Typography variant="caption" style={styles.caption}>
        {strings.common.no_users_text}
      </Typography>
      <br />
    </Paper>
  );
};

const DisabledUserEmptyState = props => {
  return (
    <Paper style={{ textAlign: "center" }}>
      <img
        src="images-for-empty-state/disabled-users-table-empty-state.png"
        alt={strings.common.no_users}
        width="505vw"
      />
      <Typography variant="subtitle1" style={styles.subtitle}>
        {strings.common.no_disabled_users}
      </Typography>
      <br />
    </Paper>
  );
};

const UserGroupsEmptyState = props => {
  return (
    <Paper style={{ textAlign: "center" }}>
      <img
        src="images-for-empty-state/users-group-table-empty-state.png"
        alt={strings.common.no_groups}
        width="597vw"
      />
      <Typography variant="subtitle1" style={styles.subtitle}>
        {strings.common.no_groups}
      </Typography>
      <Typography variant="caption" style={styles.caption}>
        {strings.common.no_groups_text}
      </Typography>
      <br />
    </Paper>
  );
};

export { EnabledUserEmptyState, DisabledUserEmptyState, UserGroupsEmptyState };
