import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { globalIntentOrder } from "../../permissions";
import green from "@material-ui/core/colors/green";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import strings from "../../localizeStrings";
import _isEmpty from "lodash/isEmpty";

const styles = theme => ({
  root: {
    width: "100%"
  },
  expansionPanel: {
    boxShadow: "none"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightMedium
  }
});

const GlobalPermissions = props => {
  const { classes, userToAdd, grantGlobalPermission, revokeGlobalPermission } = props;
  const { username, displayName, password } = userToAdd;
  return (
    <div className={classes.root}>
      <ExpansionPanel
        disabled={_isEmpty(username) || _isEmpty(displayName) || _isEmpty(password)}
        className={classes.expansionPanel}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Administrator Permissions</Typography>
        </ExpansionPanelSummary>/>
        <ExpansionPanelDetails>
          {globalIntentOrder.map((item, index) => {
            const intents = item.intents.map(intent => (
              <FormControlLabel
                key={intent}
                control={
                  <Checkbox
                    style={{ padding: "5px" }}
                    checked={false}
                    onChange={() => grantGlobalPermission(username, intent)}
                    value="checkedA"
                  />
                }
                label={strings.permissions[intent.replace(/[.]/g, "_")] || "Intent not defined"}
              />
            ));
            return (
              <div key={index} style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                <FormGroup>{intents}</FormGroup>
              </div>
            );
          })}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

export default withStyles(styles)(GlobalPermissions);
