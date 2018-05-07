import React from "react";
import { Tabs, Tab } from "material-ui/Tabs";
import OrganisationsTable from "./OrgansationsTable";
import UsersTable from "./UsersTable";
import GroupsTable from "./GroupsTable";

const styles = {
  tabs: {
    marginTop: 90
  }
};

const UsersTabs = () => (
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

export default UsersTabs;
