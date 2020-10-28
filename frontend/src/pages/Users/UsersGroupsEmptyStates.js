import Paper from "@material-ui/core/Paper";
import { withStyles, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import strings from "../../localizeStrings";

const styles = theme => {
  return {
    subtitle: {
      color: theme.palette.grey.dark
    },
    caption: {
      color: theme.palette.grey.main
    }
  };
};

// Source of images: https://undraw.co/illustrations
// selected color code: #53BBFE

const EnabledUserEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <Paper style={{ textAlign: "center" }}>
        <img
          src="images-for-empty-state/enabled-users-table-empty-state.png"
          alt={strings.common.no_users}
          width="505vw"
        />
        <Typography variant="subtitle1" className={classes.subtitle}>
          {strings.common.no_users}
        </Typography>
        <Typography variant="caption" className={classes.caption}>
          {strings.common.no_users_text}
        </Typography>
        <br />
      </Paper>
    );
  })
);

const DisabledUserEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <Paper style={{ textAlign: "center" }}>
        <img
          src="images-for-empty-state/disabled-users-table-empty-state.png"
          alt={strings.common.no_users}
          width="505vw"
        />
        <Typography variant="subtitle1" className={classes.subtitle}>
          {strings.common.no_disabled_users}
        </Typography>
        <br />
      </Paper>
    );
  })
);

const UserGroupsEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <Paper style={{ textAlign: "center" }}>
        <img
          src="images-for-empty-state/users-group-table-empty-state.png"
          alt={strings.common.no_groups}
          width="597vw"
        />
        <Typography variant="subtitle1" className={classes.subtitle}>
          {strings.common.no_groups}
        </Typography>
        <Typography variant="caption" className={classes.caption}>
          {strings.common.no_groups_text}
        </Typography>
        <br />
      </Paper>
    );
  })
);

export { EnabledUserEmptyState, DisabledUserEmptyState, UserGroupsEmptyState };
