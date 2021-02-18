import AppBar from "@material-ui/core/AppBar";
import { withStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React from "react";
import strings from "../../localizeStrings";
import CreateButton from "../Common/CreateButton";
import LoadingIndicator from "../Loading/RefreshIndicator";
import DialogContainer from "./DialogContainer";
import GroupTable from "./GroupTable";
import { DisabledUserEmptyState, EnabledUserEmptyState, UserGroupsEmptyState } from "./UsersGroupsEmptyStates";
import UsersTable from "./UsersTable";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "100%",
    marginTop: "40px"
  },
  createButtonContainer: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    alignItems: "flex-end",
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

const renderTab = props => {
  const {
    classes,
    tabIndex,
    allowedIntents,
    isDataLoading,
    enabledUsers,
    groups,
    disabledUsers,
    showDashboardDialog
  } = props;

  if (isDataLoading) {
    return <LoadingIndicator />;
  }

  switch (tabIndex) {
    // Enabled Users
    case 0:
      const isAllowedToCreateUser = allowedIntents.includes("global.createUser");
      return (
        <>
          {isAllowedToCreateUser ? (
            <CreateButton
              classes={{
                createButtonContainer: classes.createButtonContainer,
                createButton: classes.createButton
              }}
              onClick={() => showDashboardDialog("addUser")}
            />
          ) : null}
          <UsersTable {...props} classes={{}} users={enabledUsers} CustomEmptyState={EnabledUserEmptyState} />
        </>
      );

    // Groups
    case 1:
      const isAllowedToCreateGroup = allowedIntents.includes("global.createGroup");
      return (
        <>
          {isAllowedToCreateGroup ? (
            <CreateButton
              classes={{
                createButtonContainer: classes.createButtonContainer,
                createButton: classes.createButton
              }}
              onClick={() => showDashboardDialog("addGroup")}
            />
          ) : null}
          {groups.length > 0 ? <GroupTable {...props} /> : <UserGroupsEmptyState />}
        </>
      );

    // Disabled Users
    case 2:
      return (
        <>
          {disabledUsers.length > 0 ? (
            <UsersTable
              {...props}
              classes={{}}
              permissionIconDisplayed={allowedIntents.includes("global.listPermissions")}
              users={disabledUsers}
            />
          ) : (
            <DisabledUserEmptyState />
          )}
        </>
      );

    default:
      break;
  }
  return null;
};

const Users = props => {
  const { classes, tabIndex, setTabIndex } = props;
  return (
    <div data-test="userdashboard" className={classes.container}>
      <div className={classes.customWidth}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={(_, value) => setTabIndex(value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={strings.users.users} aria-label="usersTab" data-test="usersTab" />
            <Tab label={strings.users.groups} aria-label="groupsTab" />
            <Tab label={strings.users.disabled_users} aria-label="disabledUsersTab" data-test="disabledUsersTab" />
          </Tabs>
        </AppBar>
        {renderTab(props)}
      </div>
      <DialogContainer {...props} />
    </div>
  );
};

export default withStyles(styles)(Users);
