import React from "react";

import LogoutIcon from "./LogoutIcon";
import NotificationIcon from "./NotificationIcon";
import NumberOfPeersIcon from "./NumberOfPeersIcon";

const NavbarIcons = ({ numberOfActivePeers, unreadNotificationCount, history, logout }) => {
  return (
    <div style={{ display: "flex", gap: "0px" }}>
      <NotificationIcon unreadNotificationCount={unreadNotificationCount} history={history} />
      <NumberOfPeersIcon numberOfActivePeers={numberOfActivePeers} />
      <LogoutIcon history={history} logout={logout} />
    </div>
  );
};

export default NavbarIcons;
