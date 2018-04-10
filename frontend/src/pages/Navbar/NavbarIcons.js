import React from 'react';

import PeerInfoIcon from './PeerInfoIcon';
import NotificationIcon from './NotificationIcon';
import LogoutIcon from './LogoutIcon';

const NavbarIcons = ({peers, unreadNotifications, history, logout}) => {
  return (
    <div>
      <NotificationIcon
        unreadNotifications={unreadNotifications}
        history={history}/>
      <PeerInfoIcon peers={peers}/>
      <LogoutIcon history={history} logout={logout}/>
    </div>
  )
}

export default NavbarIcons;
