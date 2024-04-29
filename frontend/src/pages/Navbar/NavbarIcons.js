import React from "react";

import LogoutIcon from "./LogoutIcon";
import NotificationIcon from "./NotificationIcon";
import NumberOfPeersIcon from "./NumberOfPeersIcon";

import "./NavbarIcons.scss";

const NavbarIcons = ({ numberOfActivePeers, unreadNotificationCount, history, logout }) => {
  return (
    <div className="navbar-icons">
      <NotificationIcon unreadNotificationCount={unreadNotificationCount} history={history} />
      <NumberOfPeersIcon numberOfActivePeers={numberOfActivePeers} />
      <LogoutIcon history={history} logout={logout} />
    </div>
  );
};

export default NavbarIcons;
