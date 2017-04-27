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

import TrusteesList, { getChipList } from './TrusteesList';

const SideNavCard = ({ loggedInUser, users, history }) => (
  <div>
    <div
      style={{
        background: `url('${loggedInUser.avatar_back}') no-repeat`,
        backgroundSize: 'cover',
        height: "200px",
        position: "relative"
      }}>
      <div style={{
        bottom: 0,
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
        }}>
          <Avatar
            size={60}
            src={loggedInUser.avatar}
            style={{
              marginLeft: "16px"
            }}
          />
          <ListItem
            primaryText={<div style={{ color: colors.lightColor }}>{loggedInUser.name}</div>}
            secondaryText={<div style={{ color: colors.lightColor }}>{loggedInUser.organization}</div>}
            disabled
            style={{ paddingTop: '16px' }}
          />
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          marginLeft: '2px',
          marginBottom: '16px'
        }}>
          {getChipList(loggedInUser.role)}
        </div>
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
    </List>
    <Divider />
    <TrusteesList users={users} />

  </div>
);

export default SideNavCard;
