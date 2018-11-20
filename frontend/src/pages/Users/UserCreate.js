import React from "react";

import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import { withStyles, Divider } from "../../../node_modules/@material-ui/core";
import GlobalPermissions from "./GlobalPermissions";

const styles = {
  textInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textInput: {
    width: "50%"
  },
  container: {
    marginBottom: "20px"
  },
  checkboxContainer: {
    display: "flex",
    justifyContent: "center",
    height: "30px",
    marginTop: "25px",
    alignItems: "center"
  },
  divider: {
    marginTop: 20,
    marginBottom: 20
  }
};

const UserCreate = ({
  classes,
  userToAdd,
  setDisplayName,
  setOrganization,
  setUsername,
  setPassword,
  organization,
  setAdminPermissions,
  grantGlobalPermission,
  revokeGlobalPermission
}) => {
  const { displayName, password, username, hasAdminPermissions } = userToAdd;
  return (
    <div className={classes.container}>
      <div className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.usersDashboard.full_name}
          value={displayName}
          error={false}
          icon={<NameIcon />}
          id="fullname"
          onChange={event => setDisplayName(event.target.value)}
        />
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.usersDashboard.organization}
          value={organization}
          id="organization"
          disabled={true}
          error={false}
          icon={<OrgaIcon />}
          onChange={event => setOrganization(event.target.value)}
        />
      </div>
      <div className={classes.textInputContainer}>
        <Username username={username} storeUsername={setUsername} failed={false} id="username" />
        <Password
          password={password}
          storePassword={setPassword}
          failed={false}
          // nextBestAction={() => console.log("NextBestAction")}
          id="password"
        />
      </div>
      {/* <div className={classes.checkboxContainer}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasAdminPermissions}
              onChange={event => setAdminPermissions(event.target.checked)}
              color="primary"
            />
          }
          label={strings.permissions.admin}
        />
      </div> */}
      <Divider className={classes.divider} />
      <GlobalPermissions
        grantGlobalPermission={grantGlobalPermission}
        revokeGlobalPermission={revokeGlobalPermission}
        userToAdd={userToAdd}
      />
    </div>
  );
};
export default withStyles(styles)(UserCreate);
