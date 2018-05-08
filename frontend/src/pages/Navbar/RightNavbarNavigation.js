import React from "react";
import NavbarIcons from "./NavbarIcons";
import colors from "../../colors";
import Typography from "material-ui/Typography";

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

const RightNavbarNavigations = ({ peers, unreadNotifications, history, logout, organization }) => {
  return (
    <div style={styles.container}>
      <Typography variant="button" color="inherit" style={styles.organization}>
        {organization}
      </Typography>
      <NavbarIcons unreadNotifications={unreadNotifications} peers={peers} history={history} logout={logout} />
    </div>
  );
};

export default RightNavbarNavigations;
