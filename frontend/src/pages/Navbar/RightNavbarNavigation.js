import React from "react";
import { useLocation } from "react-router-dom";

import Typography from "@mui/material/Typography";

import NavbarIcons from "./NavbarIcons";
import ProjectSearch from "./ProjectSearch";

import "./RightNavbarNavigation.scss";

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
  let location = useLocation();
  const searchVisible = location.pathname === "/projects" && projectView === "card";
  return (
    <div className="right-navbar-container">
      {searchVisible ? (
        <ProjectSearch
          searchBarDisplayed={searchBarDisplayed}
          searchTerm={searchTerm}
          storeSearchBarDisplayed={storeSearchBarDisplayed}
          storeSearchTerm={storeSearchTerm}
        />
      ) : null}
      <Typography variant="button" color="primary" className="organization">
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
