import React from "react";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import strings from "../../localizeStrings";
import { globalIntentOrder } from "../../permissions";

const styles = {
  root: {
    width: "100%"
  },
  expansionPanel: {
    boxShadow: "none"
  },
  heading: {
    fontSize: (theme) => theme.typography.pxToRem(15),
    fontWeight: (theme) => theme.typography.fontWeightMedium
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
};

const renderPermissions = (
  globalPermissions,
  revokeGlobalPermission,
  grantGlobalPermission,
  resourceId,
  allowedIntents,
  loggedInUserId
) => {
  return globalIntentOrder.map((item, index) => {
    const intents = item.intents.map((intent) => {
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
              style={styles.checkbox}
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
      <div key={index} style={styles.formGroupDiv}>
        <FormGroup>{intents}</FormGroup>
      </div>
    );
  });
};

const GlobalPermissions = (props) => {
  const {
    resourceId,
    grantGlobalPermission,
    revokeGlobalPermission,
    globalPermissions,
    allowedIntents,
    loggedInUserId
  } = props;

  const permissions = renderPermissions(
    globalPermissions,
    revokeGlobalPermission,
    grantGlobalPermission,
    resourceId,
    allowedIntents,
    loggedInUserId
  );

  return (
    <div style={styles.root} data-test="global-permissions-dialog">
      <div style={styles.detailsDiv}>{permissions}</div>
    </div>
  );
};

export default GlobalPermissions;
