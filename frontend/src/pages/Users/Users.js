import AppBar from "@material-ui/core/AppBar";
import Fab from "@material-ui/core/Fab";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Add from "@material-ui/icons/Add";
import React from "react";

import strings from "../../localizeStrings";
import DialogContainer from "./DialogContainer";
import GroupTable from "./GroupTable";
import UsersTable from "./UsersTable";

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
  const { tabIndex, setTabIndex, showDashboardDialog, allowedIntents, isDataLoading } = props;
  const isCreateButtonDisabled =
    tabIndex === 0 ? !allowedIntents.includes("global.createUser") : !allowedIntents.includes("global.createGroup");
  const onClick = () => (tabIndex === 0 ? showDashboardDialog("addUser") : showDashboardDialog("addGroup"));
  const permissionIconDisplayed = allowedIntents.includes("global.listPermissions");
  return (
    <div data-test="userdashboard" style={styles.container}>
      <div style={styles.customWidth}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={(_, value) => setTabIndex(value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={strings.users.users} aria-label="usersTab" />
            <Tab label={strings.users.groups} aria-label="groupsTab" />
          </Tabs>
        </AppBar>
        {!isCreateButtonDisabled ? (
          <div style={styles.createButtonContainer}>
            <Fab
              disabled={isCreateButtonDisabled}
              data-test="create"
              onClick={onClick}
              color="primary"
              style={styles.createButton}
              aria-label="Add"
            >
              <Add />
            </Fab>
          </div>
        ) : null}
        {tabIndex === 0 && <UsersTable permissionIconDisplayed={permissionIconDisplayed} {...props} />}
        {isDataLoading ? <div /> : tabIndex === 1 && <GroupTable {...props} />}
      </div>
      <DialogContainer {...props} />
    </div>
  );
};

export default Users;
