import { withStyles, withTheme } from "@mui/styles";
import Typography from "@mui/material/Typography";
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

const NotificationEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <div style={{ textAlign: "center" }}>
        <img
          src="images-for-empty-state/notification-empty-state.png"
          alt={strings.common.no_notifications}
          width="505vw"
        />
        <Typography variant="body1" className={classes.caption}>
          {strings.common.no_notifications}
        </Typography>
      </div>
    );
  })
);

export default NotificationEmptyState;
