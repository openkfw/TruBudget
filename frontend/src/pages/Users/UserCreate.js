import React from "react";

import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";

const styles = {
  nodeCard: {
    width: "40%",
    paddingBottom: "20px"
  },
  card: {
    width: "100%",
    paddingBottom: "20px"
  },
  cardDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    width: 100,
    height: 100
  },
  headerText: {
    paddingRight: 0
  },
  headerFont: {
    fontSize: "25px"
  },
  cardActions: {
    display: "flex",
    justifyContent: "center"
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-around"
  },
  textInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textInput: {
    width: "50%"
  },
  container: {
    marginBottom: "30px"
  }
};

const UserCreate = ({ userToAdd, setDisplayName, setOrganization, setUsername, setPassword, organization }) => {
  const { displayName, password, username } = userToAdd;
  return (
    <div style={styles.container}>
      <div style={styles.textInputContainer}>
        <TextInputWithIcon
          style={styles.textInput}
          label={strings.usersDashboard.full_name}
          value={displayName}
          error={false}
          icon={<NameIcon />}
          id="fullname"
          onChange={event => setDisplayName(event.target.value)}
        />
        <TextInputWithIcon
          style={styles.textInput}
          label={strings.usersDashboard.organization}
          value={organization}
          id="organization"
          disabled={true}
          error={false}
          icon={<OrgaIcon />}
          onChange={event => setOrganization(event.target.value)}
        />
      </div>
      <div style={styles.textInputContainer}>
        <Username username={username} storeUsername={setUsername} failed={false} id="username" />
        <Password
          password={password}
          storePassword={setPassword}
          failed={false}
          // nextBestAction={() => console.log("NextBestAction")}
          id="password"
        />
      </div>
    </div>
  );
};
export default UserCreate;
