import React from "react";

import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";
import { withStyles } from "@material-ui/core/styles";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";

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
  user,
  setDisplayName,
  setOrganization,
  setUsername,
  setPassword,
  organization
}) => {
  const { displayName, password, username } = user;

  return (
    <div className={classes.container}>
      <div className={classes.textInputContainer}>
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.users.full_name}
          value={displayName}
          error={false}
          icon={<NameIcon />}
          id="fullname"
          onChange={event => setDisplayName(event.target.value)}
        />
        <TextInputWithIcon
          className={classes.textInput}
          label={strings.common.organization}
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
          iconDisplayed={true}
          setPassword={setPassword}
          storePassword={setPassword}
          failed={false}
          id="password"
        />
      </div>
    </div>
  );
};
export default withStyles(styles)(UserDialogContent);
