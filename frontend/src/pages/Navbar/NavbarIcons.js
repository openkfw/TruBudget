import React from "react";

import NotificationIcon from "./NotificationIcon";
import LogoutIcon from "./LogoutIcon";
import UsersIcon from "./UsersIcon";

const NavbarIcons = ({ peers, unreadNotifications, history, logout }) => {
  return (
    <div>
      <NotificationIcon unreadNotifications={unreadNotifications} history={history} />
      {/* <PeerInfoIcon peers={peers} /> */}
      <UsersIcon history={history} />
      <LogoutIcon history={history} logout={logout} />
    </div>
  );
};

export default NavbarIcons;
