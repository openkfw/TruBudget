import AppBar from "@material-ui/core/AppBar";
import { withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
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
  showUserProfile
}) => {
  return (
    <div>
      <AppBar classes={classes} position="absolute">
        <Toolbar>
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
        versions={versions}
        exportData={exportData}
        showUserProfile={showUserProfile}
      />
    </div>
  );
};

export default withStyles(styles)(Navbar);
