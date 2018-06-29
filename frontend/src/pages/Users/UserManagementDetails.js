import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import FavoriteIcon from "@material-ui/icons/Favorite";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";
const styles = {
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  card: {
    width: "55%",
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
  }
};

const handleCreate = (
  displayName,
  organization,
  password,
  username,
  createUser,
  showErrorSnackbar,
  storeSnackbarMessage
) => {
  if (displayName && organization && username && password) {
    createUser(displayName, organization, username, password);
  } else {
    // storeSnackbarMessage("Enter required information");
    // showErrorSnackbar();
  }
};
const UserManagementDetails = ({
  userToAdd,
  setDisplayName,
  setOrganization,
  setUsername,
  setPassword,
  createUser,
  showErrorSnackbar,
  storeSnackbarMessage
}) => {
  const { displayName, organization, password, username } = userToAdd;
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardHeader title={strings.adminDashboard.new_user} />
        <CardContent style={styles.cardContent}>
          <div style={styles.textInputContainer}>
            <TextInputWithIcon
              style={{ width: "50%" }}
              label={strings.adminDashboard.full_name}
              value={displayName}
              error={false}
              icon={<NameIcon />}
              onChange={event => setDisplayName(event.target.value)}
            />
            <TextInputWithIcon
              style={{ width: "50%" }}
              label={strings.adminDashboard.organization}
              value={organization}
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
              nextBestAction={() => console.log("NextBestAction")}
              id="password"
            />
          </div>
        </CardContent>
        <CardActions style={styles.cardActions}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleCreate(
                displayName,
                organization,
                password,
                username,
                createUser,
                showErrorSnackbar,
                storeSnackbarMessage
              )
            }
          >
            {/* {strings.common.create} */}
            {"Create "}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};
export default UserManagementDetails;
