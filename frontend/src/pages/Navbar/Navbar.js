import React from "react";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";

import SideNav from "./SideNav";
import LeftNavbarNavigation from "./LeftNavbarNavigation";
import MainNavbarNavigation from "./MainNavbarNavigation";
import RightNavbarNavigation from "./RightNavbarNavigation";
import { withStyles } from "material-ui/styles";

const styles = {
  root: {
    backgroundColor: "transparent",
    boxShadow: "none"
  }
};

const Navbar = ({
  onToggleSidebar,
  peers,
  unreadNotifications,
  showSidebar,
  history,
  route,
  logout,
  streamNames,
  productionActive,
  displayName,
  organization,
  avatar,
  avatarBackground,
  currentProject,
  currentSubProject,
  classes
}) => (
  <div>
    <AppBar classes={classes} position="absolute">
      <Toolbar>
        <LeftNavbarNavigation onToggleSidebar={onToggleSidebar} />
        <MainNavbarNavigation
          productionActive={productionActive}
          history={history}
          route={route}
          currentProject={currentProject}
          currentSubProject={currentSubProject}
        />
        <RightNavbarNavigation
          organization={organization}
          unreadNotifications={unreadNotifications}
          peers={peers}
          history={history}
          logout={logout}
        />
      </Toolbar>
    </AppBar>
    <SideNav
      onToggleSidebar={onToggleSidebar}
      showSidebar={showSidebar}
      history={history}
      logout={logout}
      displayName={displayName}
      organization={organization}
      avatar={avatar}
      avatarBackground={avatarBackground}
    />
  </div>
);

export default withStyles(styles)(Navbar);
