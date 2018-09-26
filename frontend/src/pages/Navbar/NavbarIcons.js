import React from "react";

import NotificationIcon from "./NotificationIcon";
import LogoutIcon from "./LogoutIcon";
import NumberOfPeersIcon from "./NumberOfPeersIcon";

const NavbarIcons = ({numberOfActivePeers, unreadNotifications, history, logout }) => {
  return (
    <div>
      <NotificationIcon unreadNotifications={unreadNotifications} history={history} />
      {/* <PeerInfoIcon peers={peers} /> */}
      <NumberOfPeersIcon numberOfActivePeers={numberOfActivePeers} />
      <LogoutIcon history={history} logout={logout} />

    </div>
  );
};

export default NavbarIcons;
