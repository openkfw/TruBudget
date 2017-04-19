import React from 'react';

import PeerInfoIcon from './PeerInfoIcon';
import NotificationIcon from './NotificationIcon';

const NavbarIcons = ({peers, unreadNotifications, history}) => {
  return (
    <div>
      <NotificationIcon
        unreadNotifications={unreadNotifications}
        history={history}/>
      <PeerInfoIcon peers={peers}/>
    </div>
  )
}

export default NavbarIcons;
