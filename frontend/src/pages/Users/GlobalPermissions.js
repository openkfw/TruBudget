import React from "react";
import { withStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { globalIntentOrder } from "../../permissions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
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
  const { classes, userToAdd, grantGlobalPermission, revokeGlobalPermission, globalPermissions, expandPermissionsPanel, permissionsExpanded } = props;
  const { username, displayName, organization } = userToAdd;

  return (
    <div className={classes.root}>
      <ExpansionPanel
        expanded={permissionsExpanded}
        disabled={_isEmpty(username) || _isEmpty(displayName) || _isEmpty(organization)}
        className={classes.expansionPanel}
        onChange = {(_, expanded) => expandPermissionsPanel(expanded)}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Administrator Permissions</Typography>
        </ExpansionPanelSummary>/>
        <ExpansionPanelDetails>
          <div style={{width: "100%", height: 210, overflowY: "scroll",  }}>
            {globalIntentOrder.map((item, index) => {
              const intents = item.intents.map(intent => (
                <FormControlLabel
                  key={intent}
                  control={
                    <Checkbox
                      style={{ padding: "5px" }}
                      checked={globalPermissions[intent] ? globalPermissions[intent].includes(username) : false}
                      onChange={() =>
                        globalPermissions[intent] && globalPermissions[intent].includes(username)
                          ? revokeGlobalPermission(username, intent)
                          : grantGlobalPermission(username, intent)
                      }
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
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

export default withStyles(styles)(GlobalPermissions);
