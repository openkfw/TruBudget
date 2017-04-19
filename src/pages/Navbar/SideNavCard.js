import React from 'react';
import { List, ListItem } from 'material-ui/List';
import SocialNotificationIcon from 'material-ui/svg-icons/social/notifications-active';
import NetworkIcon from 'material-ui/svg-icons/hardware/device-hub';
import ProjectIcon from 'material-ui/svg-icons/communication/business';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import Toggle from 'material-ui/Toggle';
import Subheader from 'material-ui/Subheader';

import colors from '../../colors';

const SideNavCard = ({ history }) => (
  <div>
    <div
      style={{
        background: "url('/mdl_back_small.jpeg') no-repeat",
        backgroundSize: 'cover',
        height: "200px",
        position: "relative"
      }}>
      <div style={{
        bottom: 0,
        position: 'absolute'
      }}>
        <Avatar
          size={60}
          src="/avatar.png"
          style={{
            marginLeft: "16px"
          }}
        />
        <ListItem
          primaryText={<div style={{ color: colors.lightColor }}>Jure Zakotnik</div>}
          secondaryText={<div style={{ color: colors.lightColor }}>ACMECorp</div>}
          disabled
          style={{ paddingTop: '16px' }}
        />
      </div>
    </div>
    <List>
      <Subheader>Selections</Subheader>
      <ListItem primaryText="Projects" leftIcon={<ProjectIcon />} onTouchTap={() => history.push('/')} />
      <ListItem primaryText="Notifications" leftIcon={<SocialNotificationIcon />} onTouchTap={() => history.push('/notifications')} />
      <ListItem primaryText="Network" leftIcon={<NetworkIcon />} onTouchTap={() => history.push('/dashboard')} />
    </List>
    <Divider />
    <List>
      <Subheader>Options</Subheader>
      <ListItem primaryText="Real-time Updates" rightToggle={<Toggle />} />
      <ListItem primaryText="Calls" rightToggle={<Toggle />} />
      <ListItem primaryText="Messages" rightToggle={<Toggle />} />
    </List>
  </div>
);

export default SideNavCard;
