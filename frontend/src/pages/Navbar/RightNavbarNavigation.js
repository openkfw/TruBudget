import React from "react";

import Typography from "@material-ui/core/Typography";

import NavbarIcons from "./NavbarIcons";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flexGrow: 1
  },
  organization: {
    paddingRight: "10px"
  }
};

const RightNavbarNavigations = ({  peers, numberOfActivePeers, unreadNotifications, history, logout, organization }) => {
  return (
    <div style={styles.container}>
      <Typography variant="button" color="primary" style={styles.organization}>
        {organization}
      </Typography>
      <NavbarIcons  unreadNotifications={unreadNotifications} numberOfActivePeers={numberOfActivePeers} peers={peers} history={history} logout={logout} />
    </div>
  );
};

export default RightNavbarNavigations;
