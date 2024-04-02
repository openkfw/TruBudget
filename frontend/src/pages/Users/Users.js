import React from "react";

import AppBar from "@mui/material/AppBar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

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
  }
};

const renderTab = (props) => {
  const { tabIndex, allowedIntents, isDataLoading, enabledUsers, groups, disabledUsers, showDashboardDialog } = props;

  if (isDataLoading) {
    return <LoadingIndicator />;
  }

  switch (tabIndex) {
    // Enabled Users
    case 0: {
      const isAllowedToCreateUser = allowedIntents.includes("global.createUser");
      return (
        <>
          {isAllowedToCreateUser ? <CreateButton onClick={() => showDashboardDialog("addUser")} /> : null}
          <UsersTable {...props} users={enabledUsers} CustomEmptyState={EnabledUserEmptyState} />
        </>
      );
    }
    // Groups
    case 1: {
      const isAllowedToCreateGroup = allowedIntents.includes("global.createGroup");
      return (
        <>
          {isAllowedToCreateGroup ? <CreateButton onClick={() => showDashboardDialog("addGroup")} /> : null}
          {groups.length > 0 ? <GroupTable {...props} /> : <UserGroupsEmptyState />}
        </>
      );
    }
    // Disabled Users
    case 2:
      return (
        <>
          {disabledUsers.length > 0 ? (
            <UsersTable
              {...props}
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

const Users = (props) => {
  const { tabIndex, setTabIndex } = props;
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

export default Users;
