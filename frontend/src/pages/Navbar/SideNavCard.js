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
import strings from '../../localizeStrings';

import TrusteesList, { getChipList } from './TrusteesList';

const SideNavCard = ({ loggedInUser, avatarBackground, avatar, displayName, organization, users, history }) => (
  <div>
    <div
      style={{
        background: `url('${avatarBackground}') no-repeat`,
        backgroundSize: 'cover',
        height: "200px",
        position: "relative"
      }}>
      <div style={{
        bottom: 0,
        position: 'absolute',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <Avatar
            size={60}
            src={avatar}
            style={{
              marginLeft: "16px"
            }}
          />
          <ListItem
            primaryText={<div style={{ color: colors.lightColor }}>{displayName}</div>}
            secondaryText={<div style={{ color: colors.lightColor }}>{organization}</div>}
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
      <Subheader>{strings.navigation.selections}</Subheader>
      <ListItem primaryText={strings.navigation.menu_item_projects} leftIcon={<ProjectIcon />} onTouchTap={() => history.push('/')} />
      <ListItem primaryText={strings.navigation.menu_item_notifications} leftIcon={<SocialNotificationIcon />} onTouchTap={() => history.push('/notifications')} />
      <ListItem primaryText={strings.navigation.menu_item_network} leftIcon={<NetworkIcon />} onTouchTap={() => history.push('/network')} />
    </List>
    <Divider />
    <List>
      <Subheader>{strings.navigation.options}</Subheader>
      <ListItem primaryText={strings.navigation.rtUpdates} rightToggle={<Toggle />} />
    </List>
    <Divider />
    {loggedInUser.role.admin ? <TrusteesList users={users} loggedInUser={loggedInUser} /> : null}
  </div >
);

export default SideNavCard;
