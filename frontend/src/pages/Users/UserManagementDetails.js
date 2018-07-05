import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";

import isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import Username from "../Common/Username";
import Password from "../Common/Password";
import TextInputWithIcon from "../Common/TextInputWithIcon";

// import IconButton from "@material-ui/core/IconButton";
// import Typography from "@material-ui/core/Typography";
// import List from "@material-ui/core/List";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemText from "@material-ui/core/ListItemText";
// import Divider from "@material-ui/core/Divider";
// import ThumbUp from "@material-ui/icons/ThumbUp";
// import ThumbDown from "@material-ui/icons/ThumbDown";

const styles = {
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
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
  }
};

const handleCreate = (
  displayName,
  organization,
  password,
  username,
  createUser,
  showSnackbar,
  showErrorSnackbar,
  storeSnackbarMessage
) => {
  if (displayName && organization && username && password) {
    createUser(displayName, organization, username, password);
    storeSnackbarMessage(strings.usersDashboard.user_created);
    showSnackbar();
  } else {
    storeSnackbarMessage("Enter required information");
    showErrorSnackbar();
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
  storeSnackbarMessage,
  organization,
  showSnackbar
}) => {
  const { displayName, password, username } = userToAdd;
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardHeader title={strings.usersDashboard.new_user} />
        <CardContent style={styles.cardContent}>
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
        </CardContent>
        <CardActions style={styles.cardActions}>
          <Button
            variant="contained"
            color="primary"
            id="createuser"
            disabled={isEmpty(displayName) || isEmpty(organization) || isEmpty(username) || isEmpty(password)}
            onClick={() =>
              handleCreate(
                displayName,
                organization,
                password,
                username,
                createUser,
                showSnackbar,
                showErrorSnackbar,
                storeSnackbarMessage
              )
            }
          >
            {strings.common.create}
          </Button>
        </CardActions>
      </Card>
      {/* <Card style={styles.nodeCard}>
        <CardHeader title={"Open Votes (Mock)"} />
        <CardContent>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="subheading"> ACMECorp</Typography>
                    <Typography> Permission: admin </Typography>
                  </div>
                }
                secondary="Votes: 1"
              />
              <IconButton>
                <ThumbUp color="primary" />
              </IconButton>
              <IconButton>
                <ThumbDown color="primary" />
              </IconButton>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="subheading"> UmbrellaCorp</Typography>
                    <Typography> Permission: base </Typography>
                  </div>
                }
                secondary="Votes: 4"
              />
              <IconButton>
                <ThumbUp color="primary" />
              </IconButton>
              <IconButton>
                <ThumbDown color="primary" />
              </IconButton>
            </ListItem>
            <Divider />
          </List>
        </CardContent>
      </Card> */}
    </div>
  );
};
export default UserManagementDetails;
