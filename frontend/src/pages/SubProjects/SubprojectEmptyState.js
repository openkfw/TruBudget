import { CardContent } from "@material-ui/core";
import List from "@material-ui/core/List";
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

const SubprojectEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <CardContent style={{ textAlign: "center" }}>
        <List>
          <img
            src="/images-for-empty-state/subproject-table-empty-state.png"
            alt={strings.common.no_subprojects}
            width="505vw"
          />
          <Typography variant="subtitle1" className={classes.subtitle}>
            {strings.common.no_subprojects}
          </Typography>
          <Typography variant="caption" className={classes.caption}>
            {strings.common.no_items_text}
          </Typography>
        </List>
      </CardContent>
    );
  })
);

export default SubprojectEmptyState;
