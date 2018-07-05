import React from "react";

import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

import UsersTable from "./UsersTable";
import NodesTable from "./NodesTable";
import blueGrey from "@material-ui/core/colors/blueGrey";
import { withStyles } from "@material-ui/core";
import strings from "../../localizeStrings";

const styles = {
  tabs: {
    marginTop: 90,
    display: "flex",
    justifyContent: "center",
    backgroundColor: blueGrey[50]
  },
  container: {
    backgroundColor: "white"
  }
};

const UserManagementTabs = ({ tabIndex, switchTabs, users, nodes, classes, ...rest }) => (
  <div className={classes.container}>
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      className={classes.tabs}
      value={tabIndex}
      onChange={(_, value) => switchTabs(value)}
    >
      <Tab label={strings.adminDashboard.users} />
      <Tab label={strings.adminDashboard.nodes} />
    </Tabs>
    {tabIndex === 0 && <UsersTable users={users} />}
    {tabIndex === 1 && <NodesTable nodes={nodes} />}
  </div>
);

export default withStyles(styles)(UserManagementTabs);
