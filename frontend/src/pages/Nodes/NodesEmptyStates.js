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

const NewOrganizationsEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <table style={{ alignItems: "center" }}>
        <tbody>
          <tr>
            <td width="200vw">
              <img
                src="images-for-empty-state/organization-empty-state.png"
                alt={strings.common.no_organizations}
                width="150vw"
              />
            </td>
            <td>
              <Typography variant="body2" className={classes.caption}>
                {strings.common.no_organizations}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    );
  })
);

const ExistingNodesEmptyState = withTheme(
  withStyles(styles)(props => {
    const { classes } = props;
    return (
      <table style={{ alignItems: "center" }}>
        <tbody>
          <tr>
            <td width="200vw">
              <img
                src="images-for-empty-state/nodes-for-orga-empty-state.png"
                alt={strings.common.no_nodes}
                width="150vw"
              />
            </td>
            <td>
              <Typography variant="body2" className={classes.caption}>
                {strings.common.no_nodes}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    );
  })
);

export { NewOrganizationsEmptyState, ExistingNodesEmptyState };
