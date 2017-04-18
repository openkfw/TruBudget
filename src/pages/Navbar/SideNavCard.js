import React from 'react';
import { List, ListItem } from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
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
      <ListItem primaryText="Projects" leftIcon={<ContentInbox />} onTouchTap={() => history.push('/')} />
      <ListItem primaryText="Notifications" leftIcon={<ActionGrade />} onTouchTap={() => history.push('/notifications')} />
      <ListItem primaryText="Dashboard" leftIcon={<ContentInbox />} onTouchTap={() => history.push('/dashboard')} />
    </List>
    <Divider />
  </div>
);

export default SideNavCard;
