import Typography from "@mui/material/Typography";
import React from "react";

import NavbarIcons from "./NavbarIcons";
import ProjectSearch from "./ProjectSearch";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flexGrow: 1,
    whiteSpace: "nowrap",
    overflow: "auto"
  },
  organization: {
    paddingRight: "10px"
  }
};

const RightNavbarNavigation = ({
  peers,
  numberOfActivePeers,
  unreadNotificationCount,
  history,
  logout,
  organization,
  storeSearchTerm,
  searchTerm,
  searchBarDisplayed,
  projectView,
  storeSearchBarDisplayed
}) => {
  const searchVisible = history.location.pathname === "/projects" && projectView === "card";
  return (
    <div style={styles.container}>
      {searchVisible ? (
        <ProjectSearch
          searchBarDisplayed={searchBarDisplayed}
          searchTerm={searchTerm}
          storeSearchBarDisplayed={storeSearchBarDisplayed}
          storeSearchTerm={storeSearchTerm}
        />
      ) : null}
      <Typography variant="button" color="primary" style={styles.organization}>
        {organization}
      </Typography>
      <NavbarIcons
        unreadNotificationCount={unreadNotificationCount}
        numberOfActivePeers={numberOfActivePeers}
        peers={peers}
        history={history}
        logout={logout}
      />
    </div>
  );
};

export default RightNavbarNavigation;
