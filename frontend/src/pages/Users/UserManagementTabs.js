import React from "react";

import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

import OrganisationsTable from "./OrgansationsTable";
import UsersTable from "./UsersTable";
import GroupsTable from "./GroupsTable";

const styles = {
  tabs: {
    marginTop: 90
  }
};

const UserManagementTabs = () => (
  <Tabs style={styles.tabs}>
    <Tab label="Organisation">
      <OrganisationsTable />
    </Tab>
    <Tab label="Groups">
      <GroupsTable />
    </Tab>
    <Tab label="Users">
      <UsersTable />
    </Tab>
  </Tabs>
);

export default UserManagementTabs;
