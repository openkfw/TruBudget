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

const BudgetEmptyState = withTheme(
  withStyles(styles)(props => {
    const { text, classes } = props;
    return (
      <table style={{ alignItems: "center" }}>
        <tbody>
          <tr height="200vh">
            <td max-width="200vw">
              <img
                src="/images-for-empty-state/project-budget-empty-state.png"
                alt={strings.common.no_budget}
                width="150vw"
              />
            </td>
            <td>
              <Typography variant="subtitle1" className={classes.subtitle}>
                {strings.common.no_budget}
              </Typography>
              <Typography variant="caption" className={classes.caption}>
                {text}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    );
  })
);

export default BudgetEmptyState;
