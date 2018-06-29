import React from "react";

import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

import OrganisationsTable from "./OrgansationsTable";
import UsersTable from "./UsersTable";
import GroupsTable from "./GroupsTable";
import { Typography } from "@material-ui/core";
import blueGrey from "@material-ui/core/colors/blueGrey";

const styles = {
  tabs: {
    marginTop: 90,
    display: "flex",
    justifyContent: "center",
    backgroundColor: blueGrey[50]
  }
};
function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

const UserManagementTabs = ({ tabIndex, switchTabs }) => (
  <div style={{ backgroundColor: "white" }}>
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      style={styles.tabs}
      value={tabIndex}
      onChange={(event, value) => switchTabs(value)}
    >
      <Tab label="Organisation" />
      <Tab label="Users" />
      <Tab label="Nodes" />
    </Tabs>
    {tabIndex === 0 && <TabContainer>Item One</TabContainer>}
    {tabIndex === 1 && <TabContainer>Item Two</TabContainer>}
    {tabIndex === 2 && <TabContainer>Item Three</TabContainer>}
  </div>
);

export default UserManagementTabs;
