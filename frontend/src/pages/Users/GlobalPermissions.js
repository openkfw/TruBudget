import React from "react";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import strings from "../../localizeStrings";
import { globalIntentOrder } from "../../permissions";

import "./GlobalPermissions.scss";

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
              className="checkbox"
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
      <div key={index} className="form-group">
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
    <div className="global-permissions" data-test="global-permissions-dialog">
      <div className="details">{permissions}</div>
    </div>
  );
};

export default GlobalPermissions;
