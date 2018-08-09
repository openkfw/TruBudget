import React from "react";
import UsersTable from "./UsersTable";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import GroupTable from "./GroupTable";
import Button from "@material-ui/core/Button";
import Add from "@material-ui/icons/Add";
import DashboardDialogContainer from "./DashboardDialogContainer";
import strings from "../../localizeStrings";
import { withStyles } from "../../../node_modules/@material-ui/core";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "90%",
    marginTop: "40px"
  },
  createButtonContainer: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    alignItems: "center",
    top: "80px",
    right: "-20px",
    width: "30%",
    height: 20
  },
  createButton: {
    position: "absolute",
    marginTop: -20
  }
};
const Users = props => {
  const { tabIndex, setTabIndex, showDashboardDialog, classes } = props;
  return (
    <div id="userdashboard" className={classes.container}>
      <div className={classes.customWidth}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={(_, value) => setTabIndex(value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={strings.usersDashboard.users} aria-label="usersTab" />
            <Tab label={strings.groupDashboard.groups} aria-label="groupsTab" />
          </Tabs>
        </AppBar>
        <div className={classes.createButtonContainer}>
          <Button
            data-test="create"
            onClick={() => {
              tabIndex === 0 ? showDashboardDialog("addUser") : showDashboardDialog("addGroup");
            }}
            color="primary"
            className={classes.createButton}
            variant="fab"
            aria-label="Add"
          >
            <Add />
          </Button>
        </div>
        {tabIndex === 0 && <UsersTable {...props} />}
        {tabIndex === 1 && <GroupTable {...props} />}
      </div>
      <DashboardDialogContainer {...props} />
    </div>
  );
};

export default withStyles(styles)(Users);
