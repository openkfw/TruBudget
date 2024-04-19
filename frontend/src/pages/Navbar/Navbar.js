import React from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import LeftNavbarNavigation from "./LeftNavbarNavigation";
import RightNavbarNavigation from "./RightNavbarNavigation";
import SideNav from "./SideNav";

import "./Navbar.scss";

const Navbar = ({
  toggleSidebar,
  numberOfActivePeers,
  peers,
  unreadNotificationCount,
  showSidebar,
  history,
  logout,
  displayName,
  organization,
  avatar,
  avatarBackground,
  allowedIntents,
  groups,
  userId,
  createBackup,
  restoreBackup,
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
      <AppBar className="navbar">
        <Toolbar id="back-to-top">
          <LeftNavbarNavigation toggleSidebar={toggleSidebar} />
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
        showUserProfile={showUserProfile}
        fetchEmailAddress={fetchEmailAddress}
        {...props}
      />
    </div>
  );
};

export default Navbar;
