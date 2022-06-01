import AppBar from "@mui/material/AppBar";
import { withStyles } from "@mui/styles";
import Toolbar from "@mui/material/Toolbar";
import React from "react";

import LeftNavbarNavigation from "./LeftNavbarNavigation";
import MainNavbarNavigation from "./MainNavbarNavigation";
import RightNavbarNavigation from "./RightNavbarNavigation";
import SideNav from "./SideNav";

const styles = {
  root: {
    backgroundColor: "transparent",
    boxShadow: "none"
  }
};

const Navbar = ({
  toggleSidebar,
  numberOfActivePeers,
  peers,
  unreadNotificationCount,
  showSidebar,
  history,
  route,
  logout,
  productionActive,
  displayName,
  organization,
  avatar,
  avatarBackground,
  currentProject,
  currentSubProject,
  allowedIntents,
  environment,
  groups,
  userId,
  createBackup,
  restoreBackup,
  classes,
  versions,
  exportData,
  storeSearchTerm,
  searchTerm,
  storeSearchBarDisplayed,
  searchBarDisplayed,
  showUserProfile,
  fetchEmailAddress,
  projectView,
  ...props
}) => {
  return (
    <div>
      <AppBar classes={classes} position="absolute">
        <Toolbar id="back-to-top">
          <LeftNavbarNavigation toggleSidebar={toggleSidebar} />
          <MainNavbarNavigation
            productionActive={productionActive}
            history={history}
            route={route}
            currentProject={currentProject}
            currentSubProject={currentSubProject}
            environment={environment}
            storeSearchBarDisplayed={storeSearchBarDisplayed}
            storeSearchTerm={storeSearchTerm}
          />
          <RightNavbarNavigation
            organization={organization}
            unreadNotificationCount={unreadNotificationCount}
            numberOfActivePeers={numberOfActivePeers}
            peers={peers}
            history={history}
            logout={logout}
            storeSearchTerm={storeSearchTerm}
            storeSearchBarDisplayed={storeSearchBarDisplayed}
            searchTerm={searchTerm}
            searchBarDisplayed={searchBarDisplayed}
            projectView={projectView}
          />
        </Toolbar>
      </AppBar>
      <SideNav
        toggleSidebar={toggleSidebar}
        showSidebar={showSidebar}
        history={history}
        logout={logout}
        allowedIntents={allowedIntents}
        displayName={displayName}
        organization={organization}
        avatar={avatar}
        avatarBackground={avatarBackground}
        groups={groups}
        userId={userId}
        createBackup={createBackup}
        restoreBackup={restoreBackup}
        exportData={exportData}
        environment={environment}
        showUserProfile={showUserProfile}
        fetchEmailAddress={fetchEmailAddress}
        {...props}
      />
    </div>
  );
};

export default withStyles(styles)(Navbar);
