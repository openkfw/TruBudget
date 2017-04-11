import React from 'react';
import {List, ListItem} from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentSend from 'material-ui/svg-icons/content/send';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';
import Divider from 'material-ui/Divider';
import ActionInfo from 'material-ui/svg-icons/action/info';
import Avatar from 'material-ui/Avatar';
import {Link} from 'react-router';
import colors from '../../colors';

const SideNavCard = () => (
  <div>
    <div
      style={{
        background: "url('mdl_back_small.jpeg') no-repeat",
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
          src="avatar.png"
          style={{
            marginLeft: "16px"
          }}
        />
        <ListItem
          primaryText={<div style={{color: colors.lightColor}}>Jure Zakotnik</div>}
          secondaryText={<div style={{color: colors.lightColor}}>ACMECorp</div>}
          disabled
          style={{paddingTop: '16px'}}
        />
      </div>
    </div>
    <List>
        <ListItem primaryText="Workflows" leftIcon={<ContentInbox />} />
        <ListItem primaryText = "Add Workflow" leftIcon={<ActionGrade />} />
        <ListItem primaryText="Sent mail" leftIcon={<ContentSend />} />
        <ListItem primaryText="Drafts" leftIcon={<ContentDrafts />} />
        <ListItem primaryText="Inbox" leftIcon={<ContentInbox />} />
      </List>
      <Divider />
      <List>
        <ListItem primaryText="All mail" rightIcon={<ActionInfo />} />
        <ListItem primaryText="Trash" rightIcon={<ActionInfo />} />
        <ListItem primaryText="Spam" rightIcon={<ActionInfo />} />
        <ListItem primaryText="Follow up" rightIcon={<ActionInfo />} />
      </List>
    </div>
);

export default SideNavCard;
