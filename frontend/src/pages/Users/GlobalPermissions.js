import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { globalIntentOrder } from "../../permissions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import strings from "../../localizeStrings";

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
  },
  detailsDiv: {
    width: "100%"
  },
  checkbox: {
    padding: "5px"
  },
  formGroupDiv: {
    display: "flex",
    width: "100%",
    justifyContent: "center"
  }
});

const renderPermissions = (
  classes,
  globalPermissions,
  revokeGlobalPermission,
  grantGlobalPermission,
  resourceId,
  allowedIntents,
  loggedInUserId
) => {
  return globalIntentOrder.map((item, index) => {
    const intents = item.intents.map(intent => {
      const checked = globalPermissions[intent] ? globalPermissions[intent].includes(resourceId) : false;
      const isLoggedInUser = resourceId === loggedInUserId;
      const disabled = checked
        ? allowedIntents.includes("global.revokePermission") && !isLoggedInUser
        : allowedIntents.includes("global.grantPermission") && !isLoggedInUser;
      return (
        <FormControlLabel
          key={intent}
          data-test={`permission-${intent}`}
          control={
            <Checkbox
              className={classes.checkbox}
              checked={checked}
              disabled={!disabled}
              onChange={() =>
                globalPermissions[intent] && globalPermissions[intent].includes(resourceId)
                  ? revokeGlobalPermission(intent, resourceId)
                  : grantGlobalPermission(intent, resourceId)
              }
            />
          }
          label={strings.permissions[intent.replace(/[.]/g, "_")] || "Intent not defined"}
        />
      );
    });
    return (
      <div key={index} className={classes.formGroupDiv}>
        <FormGroup>{intents}</FormGroup>
      </div>
    );
  });
};

const GlobalPermissions = props => {
  const {
    classes,
    resourceId,
    grantGlobalPermission,
    revokeGlobalPermission,
    globalPermissions,
    allowedIntents,
    loggedInUserId
  } = props;
  const permissions = renderPermissions(
    classes,
    globalPermissions,
    revokeGlobalPermission,
    grantGlobalPermission,
    resourceId,
    allowedIntents,
    loggedInUserId
  );
  return (
    <div className={classes.root} data-test="global-permissions-dialog">
      <div className={classes.detailsDiv}>{permissions}</div>
    </div>
  );
};

export default withStyles(styles)(GlobalPermissions);
