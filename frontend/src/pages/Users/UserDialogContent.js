import React from "react";

import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import { withStyles, Divider } from "@material-ui/core";
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

const UserDialogContent = ({
  classes,
  userToAdd,
  setDisplayName,
  setOrganization,
  setUsername,
  setPassword,
  organization,
  setAdminPermissions,
  grantGlobalPermission,
  revokeGlobalPermission,
  globalPermissions,
  editMode,
  expandPermissionsPanel,
  permissionsExpanded
}) => {
  const { displayName, password, username } = userToAdd;
  const disabled= editMode ? true: false
  return (
    <div  className={classes.container}>
      <div  className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.usersDashboard.full_name}
          value={displayName}
          error={false}
          disabled={disabled}
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
        <Username username={username}   disabled={disabled} storeUsername={setUsername} failed={false} id="username" />
        <Password
          password={password}
          storePassword={setPassword}
          failed={false}
          disabled={disabled}
          id="password"
        />
      </div>
      {editMode ? (
        <div >
          <Divider className={classes.divider} />
          <GlobalPermissions
            grantGlobalPermission={grantGlobalPermission}
            revokeGlobalPermission={revokeGlobalPermission}
            userToAdd={userToAdd}
            globalPermissions={globalPermissions}
            expandPermissionsPanel = {expandPermissionsPanel}
          permissionsExpanded ={permissionsExpanded}
          />
        </div>
      ) : null}
    </div>
  );
};
export default withStyles(styles)(UserDialogContent);
